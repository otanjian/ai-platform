import { type MiddlewareHandler } from "hono"
import { db } from "../db/db.js"
import * as schema from "../db/schema.js"
import type { Session } from "../types.js"

export function auditLogger(): MiddlewareHandler {
  return async (c, next) => {
    const start = Date.now()
    await next()
    const duration = Date.now() - start

    const session = c.get("session") as Session | undefined
    const platformUserId = c.get("platformUserId") as number | undefined
    const path = c.req.path
    const method = c.req.method
    const subsystem = inferSubsystem(path)

    let requestBody: unknown = null
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        requestBody = await c.req.json()
      } catch {
        requestBody = null
      }
    }

    // Don't block response writing
    setTimeout(async () => {
      try {
        await db.insert(schema.auditLog).values({
          platformUserId,
          action: `${method} ${path}`,
          subsystem: subsystem as any,
          requestPath: path,
          requestMethod: method,
          statusCode: c.res.status,
          ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "",
          userAgent: c.req.header("user-agent") || "",
          requestBody,
          responseBody: null,
          createdAt: new Date(),
        })
      } catch (err) {
        console.error("Failed to write audit log:", err)
      }
    }, 0)
  }
}

function inferSubsystem(path: string): string {
  if (path.startsWith("/api/code")) return "opencode"
  if (path.startsWith("/api/bi")) return "superset"
  if (path.startsWith("/api/taskview")) return "taskview"
  if (path.startsWith("/api/agent")) return "buildingai"
  if (path.startsWith("/api/pipeline") || path.startsWith("/api/admin")) return "platform"
  return "platform"
}
