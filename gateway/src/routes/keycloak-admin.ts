import { Hono } from "hono"
import { KeycloakAdminClient } from "../keycloak.js"
import { getFieldPermissions, filterFields } from "../sync.js"
import { isValidBuildingAiPassword, syncUserToBuildingAi } from "../buildingai-sync.js"
import { syncUserToTaskView } from "../taskview-sync.js"
import { syncUserToSuperset } from "../superset-sync.js"
import type { GatewayConfig } from "../types.js"

export function keycloakAdminRouter(config: GatewayConfig) {
  const app = new Hono()
  const kc = new KeycloakAdminClient(config.keycloak)

  // Users
  app.get("/users", async (c) => {
    const users = await kc.listUsers()
    return c.json(users)
  })

  app.post("/users", async (c) => {
    const body = (await c.req.json()) as {
      username: string
      email?: string
      firstName?: string
      lastName?: string
      enabled?: boolean
      password?: string
    }
    if (body.password && !isValidBuildingAiPassword(body.password)) {
      return c.json(
        { error: "密码须为 6–20 位且同时包含字母和数字（与 BuildingAI 一致）" },
        400,
      )
    }
    const { password, ...userFields } = body
    const result = await kc.createUser(userFields)
    let buildingAiSync: Awaited<ReturnType<typeof syncUserToBuildingAi>> | null = null
    let taskViewSync: Awaited<ReturnType<typeof syncUserToTaskView>> | null = null
    let supersetSync: Awaited<ReturnType<typeof syncUserToSuperset>> | null = null
    if (password && result.id) {
      await kc.setUserPassword(result.id, password, false)
      const syncInput = {
        username: body.username,
        password,
        email: body.email,
        nickname: body.firstName || body.username,
        isAdmin: body.username.trim().toLowerCase() === "admin",
      }
      ;[buildingAiSync, taskViewSync, supersetSync] = await Promise.all([
        syncUserToBuildingAi(config, syncInput),
        syncUserToTaskView(config, syncInput),
        syncUserToSuperset(config, syncInput),
      ])
    }
    return c.json({ ...result, buildingAiSync, taskViewSync, supersetSync }, 201)
  })

  app.get("/users/:id", async (c) => {
    const user = await kc.getUserById(c.req.param("id"))
    if (!user) return c.json({ error: "Not found" }, 404)
    const userId = c.get("platformUserId") as number | undefined
    if (userId) {
      const perms = await getFieldPermissions(userId, "user")
      return c.json(filterFields(user as Record<string, unknown>, perms))
    }
    return c.json(user)
  })

  app.put("/users/:id", async (c) => {
    const body = await c.req.json()
    await kc.updateUser(c.req.param("id"), body)
    return c.json({ success: true })
  })

  app.delete("/users/:id", async (c) => {
    await kc.deleteUser(c.req.param("id"))
    return c.json({ success: true })
  })

  app.put("/users/:id/password", async (c) => {
    const { password, temporary } = (await c.req.json()) as {
      password: string
      temporary?: boolean
    }
    if (!isValidBuildingAiPassword(password)) {
      return c.json(
        { error: "密码须为 6–20 位且同时包含字母和数字（与 BuildingAI 一致）" },
        400,
      )
    }
    const userId = c.req.param("id")
    await kc.setUserPassword(userId, password, temporary ?? false)
    const user = await kc.getUserById(userId)
    let buildingAiSync: Awaited<ReturnType<typeof syncUserToBuildingAi>> | null = null
    let taskViewSync: Awaited<ReturnType<typeof syncUserToTaskView>> | null = null
    let supersetSync: Awaited<ReturnType<typeof syncUserToSuperset>> | null = null
    if (user?.username) {
      const syncInput = {
        username: user.username,
        password,
        email: user.email,
        nickname: user.firstName || user.username,
        isAdmin: user.username.trim().toLowerCase() === "admin",
      }
      ;[buildingAiSync, taskViewSync, supersetSync] = await Promise.all([
        syncUserToBuildingAi(config, syncInput),
        syncUserToTaskView(config, syncInput),
        syncUserToSuperset(config, syncInput),
      ])
    }
    const failures = [
      buildingAiSync && !buildingAiSync.ok ? `BuildingAI: ${buildingAiSync.error}` : null,
      taskViewSync && !taskViewSync.ok ? `TaskView: ${taskViewSync.error}` : null,
      supersetSync && !supersetSync.ok ? `Superset: ${supersetSync.error}` : null,
    ].filter(Boolean)
    return c.json({
      success: true,
      buildingAiSync,
      taskViewSync,
      supersetSync,
      warning: failures.length ? `Keycloak 密码已更新，但子系统同步失败：${failures.join("; ")}` : undefined,
    })
  })

  app.get("/users/:id/roles", async (c) => {
    const roles = await kc.getUserRealmRoles(c.req.param("id"))
    return c.json(roles)
  })

  app.put("/users/:id/roles", async (c) => {
    const { assign, remove } = (await c.req.json()) as { assign?: string[]; remove?: string[] }
    if (assign && assign.length > 0) await kc.assignRealmRoles(c.req.param("id"), assign)
    if (remove && remove.length > 0) await kc.removeRealmRoles(c.req.param("id"), remove)
    return c.json({ success: true })
  })

  app.get("/users/:id/groups", async (c) => {
    const groups = await kc.getUserGroups(c.req.param("id"))
    return c.json(groups)
  })

  app.put("/users/:id/groups", async (c) => {
    const { assign, remove } = (await c.req.json()) as { assign?: string[]; remove?: string[] }
    const userId = c.req.param("id")
    if (assign && assign.length > 0) {
      for (const groupId of assign) await kc.addUserToGroup(userId, groupId)
    }
    if (remove && remove.length > 0) {
      for (const groupId of remove) await kc.removeUserFromGroup(userId, groupId)
    }
    return c.json({ success: true })
  })

  app.get("/users/:id/sessions", async (c) => {
    const sessions = await kc.listUserSessions(c.req.param("id"))
    return c.json(sessions)
  })

  app.post("/users/:id/logout", async (c) => {
    await kc.logoutUser(c.req.param("id"))
    return c.json({ success: true })
  })

  // Roles
  app.get("/roles", async (c) => {
    const roles = await kc.listRealmRoles()
    return c.json(roles)
  })

  app.post("/roles", async (c) => {
    const body = await c.req.json()
    await kc.createRealmRole(body)
    return c.json({ success: true }, 201)
  })

  app.delete("/roles/:name", async (c) => {
    await kc.deleteRealmRole(c.req.param("name"))
    return c.json({ success: true })
  })

  // Groups
  app.get("/groups", async (c) => {
    const groups = await kc.listGroups()
    return c.json(groups)
  })

  app.post("/groups", async (c) => {
    const body = await c.req.json()
    const result = await kc.createGroup(body)
    return c.json(result, 201)
  })

  app.delete("/groups/:id", async (c) => {
    await kc.deleteGroup(c.req.param("id"))
    return c.json({ success: true })
  })

  return app
}
