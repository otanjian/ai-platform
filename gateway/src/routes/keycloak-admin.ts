import { Hono } from "hono"
import { KeycloakAdminClient } from "../keycloak.js"
import { getFieldPermissions, filterFields } from "../sync.js"
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
    const body = await c.req.json()
    const result = await kc.createUser(body)
    return c.json(result, 201)
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
    const { password, temporary } = await c.req.json()
    await kc.setUserPassword(c.req.param("id"), password, temporary ?? false)
    return c.json({ success: true })
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
