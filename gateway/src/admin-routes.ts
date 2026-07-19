import { Hono } from "hono"
import type { MiddlewareHandler } from "hono"
import type { UserStore } from "./user-store"
import type { AuthManager } from "./auth"
import { createAdminPage } from "./templates"
import type { GatewayConfig, User } from "./types"
import { mapGroupsToProjects } from "./oidc"

export function createAdminApp(auth: AuthManager, userStore: UserStore, config: GatewayConfig): Hono {
  const app = new Hono()

  app.use("*", requireAdmin(auth, userStore, config))

  app.get("/", (c) => {
    const user = c.get("user")
    return c.html(createAdminPage(user?.username ?? ""))
  })

  app.get("/api/users", (c) => {
    return c.json({
      users: userStore.getUsers().map((u) => ({ username: u.username, projects: u.projects })),
      projects: userStore.getProjects(),
    })
  })

  app.post("/api/users", async (c) => {
    const body = await c.req.parseBody<{
      username?: string
      password?: string
      projects?: string
    }>()
    if (!body.username || !body.password) {
      return c.json({ error: "username and password are required" }, 400)
    }
    const username = body.username.trim()
    const projectList = body.projects
      ? body.projects
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : []
    try {
      const passwordHash = await Bun.password.hash(body.password, { algorithm: "bcrypt" })
      await userStore.addUser({ username, passwordHash, projects: projectList })
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400)
    }
  })

  app.delete("/api/users/:username", async (c) => {
    const username = c.req.param("username")
    try {
      await userStore.removeUser(username)
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400)
    }
  })

  app.post("/api/users/:username/password", async (c) => {
    const username = c.req.param("username")
    const body = await c.req.parseBody<{ password?: string }>()
    if (!body.password) {
      return c.json({ error: "password is required" }, 400)
    }
    try {
      const passwordHash = await Bun.password.hash(body.password, { algorithm: "bcrypt" })
      await userStore.setPassword(username, passwordHash)
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400)
    }
  })

  app.post("/api/users/:username/projects", async (c) => {
    const username = c.req.param("username")
    const body = await c.req.parseBody<{ projects?: string }>()
    const projectList = body.projects
      ? body.projects
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : []
    try {
      await userStore.setUserProjects(username, projectList)
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400)
    }
  })

  app.get("/api/projects", (c) => {
    return c.json({ projects: userStore.getProjects() })
  })

  app.post("/api/projects", async (c) => {
    const body = await c.req.parseBody<{ path?: string }>()
    if (!body.path) {
      return c.json({ error: "path is required" }, 400)
    }
    try {
      await userStore.addProject(body.path.trim())
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400)
    }
  })

  app.delete("/api/projects/:path", async (c) => {
    const encodedPath = c.req.param("path")
    const projectPath = decodeURIComponent(encodedPath)
    try {
      await userStore.removeProject(projectPath)
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400)
    }
  })

  return app
}

function requireAdmin(auth: AuthManager, userStore: UserStore, config: GatewayConfig): MiddlewareHandler {
  return async (c, next) => {
    const session = auth.getSession(c)
    if (!session) {
      return c.redirect("/login")
    }
    let user: User | null
    if (config.oidc && session.oidc) {
      user = {
        username: session.oidc.username,
        passwordHash: "",
        projects: mapGroupsToProjects(session.oidc.groups, config.oidc.groupMapping),
      }
    } else {
      user = auth.getLocalUser(session.username, userStore) || null
    }
    if (!user) {
      auth.clearSession(c)
      return c.redirect("/login")
    }
    if (!auth.isAdmin(user.username)) {
      return c.text("Forbidden", 403)
    }
    c.set("user", user)
    await next()
  }
}
