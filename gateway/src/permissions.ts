import { type Context, type MiddlewareHandler } from "hono"
import { getPlatformUserByKeycloakId, getUserPermissions } from "./sync.js"
import type { OidcSessionData } from "./types.js"

export type MenuCode =
  | "dashboard"
  | "code_factory"
  | "data_insights"
  | "ai_brain"
  | "smart_pipeline"
  | "system_settings"

const MODULE_TO_MENU: Record<string, MenuCode> = {
  "/api/code": "code_factory",
  "/api/bi": "data_insights",
  "/api/agent": "ai_brain",
  "/api/pipeline": "smart_pipeline",
  "/api/admin": "system_settings",
}

export function requireMenuPermission(menu: MenuCode): MiddlewareHandler {
  return async (c, next) => {
    const session = c.get("session") as { oidc?: OidcSessionData } | undefined
    if (!session?.oidc) {
      return c.json({ error: "Unauthorized" }, 401)
    }
    const platformUser = await getPlatformUserByKeycloakId(session.oidc.sub)
    if (!platformUser) {
      return c.json({ error: "User not synchronized" }, 403)
    }
    const permissions = await getUserPermissions(platformUser.id)
    const permission = permissions.get(menu) ?? "none"
    if (permission === "none") {
      return c.json({ error: "Forbidden" }, 403)
    }
    c.set("platformUserId", platformUser.id)
    c.set("menuPermission", permission)
    await next()
  }
}

export function requireModuleAccess(): MiddlewareHandler {
  return async (c, next) => {
    const path = c.req.path
    const menu = Object.entries(MODULE_TO_MENU).find(([prefix]) => path.startsWith(prefix))?.[1]
    if (!menu) {
      await next()
      return
    }
    return requireMenuPermission(menu)(c, next)
  }
}

export function getPlatformUserId(c: Context): number {
  return c.get("platformUserId") as number
}

export function getMenuPermission(c: Context): string {
  return c.get("menuPermission") as string
}
