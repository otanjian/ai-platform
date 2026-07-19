import { Hono } from "hono"
import { type MiddlewareHandler } from "hono"
import { deleteCookie, setCookie, getCookie } from "hono/cookie"
import { loadConfig } from "./config.js"
import { AuthManager } from "./auth.js"
import { OidcClient, type OidcState, type OidcUserInfo } from "./oidc.js"
import { KeycloakAdminClient } from "./keycloak.js"
import { syncUserFromKeycloak, getPlatformUserByKeycloakId } from "./sync.js"
import { requireModuleAccess, getPlatformUserId } from "./permissions.js"
import { proxyHttp } from "./proxy.js"
import { triSystemRouter } from "./routes/tri-system.js"
import { platformRouter } from "./routes/platform.js"
import { keycloakAdminRouter } from "./routes/keycloak-admin.js"
import { auditLogger } from "./middleware/audit.js"
import { db } from "./db/db.js"
import { closeRedis } from "./db/redis.js"
import { sql } from "drizzle-orm"
import type { GatewayConfig, OidcConfig, Session, OidcSessionData, User } from "./types.js"

type Variables = {
  session?: Session
  platformUserId?: number
  menuPermission?: string
  user?: User
}

declare module "hono" {
  interface ContextVariableMap extends Variables {}
}

async function main() {
  const configPath = process.env.AIPLATFORM_GATEWAY_CONFIG
  const config = await loadConfig(configPath)

  const auth = new AuthManager(config)
  const oidc = config.oidc ? new OidcClient(config.oidc) : null
  const keycloakAdmin = new KeycloakAdminClient(config.keycloak)
  const oidcStates = new Map<string, OidcState>()

  const app = new Hono<{ Variables: Variables }>()

  // Global session middleware
  app.use("*", async (c, next) => {
    const session = auth.getSession(c)
    if (session) {
      c.set("session", session)
    }
    await next()
  })

  // Public health check (no auth required)
  app.get("/api/gateway/health", async (c) => {
    return c.json({
      status: "ok",
      database: await checkDatabase(),
      redis: "connected",
      keycloak: config.keycloak.url,
    })
  })

  // Login
  app.get("/login", async (c) => {
    if (!oidc) {
      return c.text("Local login is not supported in this configuration", 403)
    }
    auth.clearSession(c)
    const state = oidc.createAuthorizationUrl()
    oidcStates.set(state.state, state)
    const url = await oidc.buildAuthorizationRedirectUrl(state)
    c.header("Cache-Control", "no-store, no-cache, must-revalidate")
    c.header("Pragma", "no-cache")
    return c.redirect(url)
  })

  // OIDC callback
  app.get("/auth/callback", async (c) => {
    if (!oidc) {
      return c.text("OIDC is not configured", 400)
    }
    const stateParam = c.req.query("state")
    const code = c.req.query("code")
    const error = c.req.query("error")
    if (error) {
      return c.text(`OIDC error: ${c.req.query("error_description") || error}`, 400)
    }
    if (!stateParam || !code) {
      return c.text("Missing OIDC state or code", 400)
    }
    const state = oidcStates.get(stateParam)
    oidcStates.delete(stateParam)
    if (!state) {
      return c.text("Invalid OIDC state", 400)
    }
    try {
      const tokens = await oidc.exchangeCode(code, state.redirectUri, state.codeVerifier)
      const userInfo = await oidc.getUserInfo(tokens.access_token)
      const oidcData = buildOidcSession(userInfo, tokens)
      await syncUserFromKeycloak(oidcData.sub, oidcData.username, oidcData.email, keycloakAdmin)
      auth.createOidcSession(c, oidcData)
      return c.redirect(`${config.frontendUrl}/dashboard`)
    } catch (err) {
      console.error("OIDC callback failed:", err)
      return c.text(`OIDC login failed: ${(err as Error).message}`, 500)
    }
  })

  // Logout
  app.get("/logout", async (c) => {
    auth.clearSession(c)
    deleteCookie(c, "aiplatform_project")
    if (!oidc) {
      return c.redirect(`${config.frontendUrl}/login`)
    }
    const logoutUrl = await oidc.buildLogoutUrl(`${config.frontendUrl}/login`)
    if (logoutUrl) {
      return c.redirect(logoutUrl)
    }
    return c.redirect(`${config.frontendUrl}/login`)
  })

  // Session info
  app.get("/api/session", (c) => {
    const session = c.get("session")
    if (!session) return c.json({ authenticated: false }, 401)
    return c.json({
      authenticated: true,
      username: session.username,
      oidc: session.oidc
        ? {
            sub: session.oidc.sub,
            email: session.oidc.email,
            name: session.oidc.name,
            realmRoles: session.oidc.realmRoles,
            groups: session.oidc.groups,
          }
        : null,
    })
  })

  // Protected tri-system routes
  app.use("/api/*", requireAuth(auth, keycloakAdmin))
  app.use("/api/*", auditLogger())
  app.use("/api/code/*", requireModuleAccess())
  app.use("/api/bi/*", requireModuleAccess())
  app.use("/api/agent/*", requireModuleAccess())
  app.use("/api/pipeline/*", requireModuleAccess())
  app.use("/api/admin/*", requireModuleAccess())
  app.route("/api", triSystemRouter(config))
  app.route("/api", platformRouter(config))
  app.route("/api/admin/keycloak", keycloakAdminRouter(config))

  // 404
  app.notFound((c) => c.json({ error: "Not found" }, 404))

  // Global error handler
  app.onError((err, c) => {
    console.error("Unhandled error:", err)
    return c.json({ error: "Internal server error" }, 500)
  })

  const server = Bun.serve({
    port: config.port,
    hostname: config.host,
    fetch: app.fetch,
  })

  console.log(`AI Platform BFF gateway running at http://${config.host}:${config.port}`)
  if (config.oidc) {
    console.log(`OIDC login enabled via ${config.oidc.issuer}`)
  }

  process.on("SIGINT", async () => {
    console.log("\nShutting down gateway...")
    server.stop(true)
    await closeRedis()
    process.exit(0)
  })
}

function buildOidcSession(userInfo: OidcUserInfo, tokens: { access_token: string; refresh_token?: string; expires_at: number }): OidcSessionData {
  const realmRoles = extractRealmRoles(userInfo)
  return {
    sub: userInfo.sub,
    username: userInfo.preferred_username || userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    groups: extractGroups(userInfo),
    realmRoles,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_at,
  }
}

function extractGroups(userInfo: OidcUserInfo): string[] {
  const groups = userInfo.groups
  if (!groups) return []
  if (Array.isArray(groups)) return groups
  if (typeof groups === "string") return [groups]
  return []
}

function extractRealmRoles(userInfo: OidcUserInfo): string[] {
  const roles = userInfo.realm_roles
  if (!roles) return []
  if (Array.isArray(roles)) return roles
  if (typeof roles === "string") return [roles]
  return []
}

function requireAuth(auth: AuthManager, keycloakAdmin: KeycloakAdminClient): MiddlewareHandler {
  return async (c, next) => {
    const session = auth.getSession(c)
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    c.set("session", session)
    if (session.oidc) {
      try {
        const platformUser = await getPlatformUserByKeycloakId(session.oidc.sub)
        if (platformUser) {
          c.set("platformUserId", platformUser.id)
        } else {
          await syncUserFromKeycloak(session.oidc.sub, session.oidc.username, session.oidc.email, keycloakAdmin)
          const synced = await getPlatformUserByKeycloakId(session.oidc.sub)
          if (synced) c.set("platformUserId", synced.id)
        }
      } catch (err) {
        console.error("Failed to resolve platform user:", err)
      }
    }
    await next()
  }
}

async function checkDatabase(): Promise<string> {
  try {
    await db.execute(sql`SELECT 1`)
    return "connected"
  } catch (err) {
    return "disconnected"
  }
}

main().catch((err) => {
  console.error("Failed to start gateway:", err)
  process.exit(1)
})
