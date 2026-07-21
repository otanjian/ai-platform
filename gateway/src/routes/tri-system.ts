import { Hono } from "hono"
import { getPlatformUserId } from "../permissions.js"
import { getToken, setToken } from "../db/redis.js"
import { mintBuildingAiEmbedToken } from "../buildingai-embed.js"
import { mintTaskViewEmbedToken } from "../taskview-embed.js"
import { mintSupersetEmbedToken } from "../superset-embed.js"
import type { GatewayConfig, Session } from "../types.js"

export function triSystemRouter(config: GatewayConfig) {
  const app = new Hono<{ Variables: { session?: Session; platformUserId?: number } }>()

  app.all("/code/*", async (c) => {
    const target = `${config.subsystems.opencode.baseUrl}${c.req.path.replace("/api/code", "")}`
    const req = new Request(target, c.req.raw)
    req.headers.delete("cookie")
    if (config.subsystems.opencode.password) {
      req.headers.set("Authorization", `Basic ${btoa(`server:${config.subsystems.opencode.password}`)}`)
    }
    const res = await fetch(req)
    return new Response(res.body, { status: res.status, headers: res.headers })
  })

  app.get("/taskview/embed-session", async (c) => {
    const session = c.get("session")
    const username = session?.username
    if (!username) return c.json({ ok: false, error: "Unauthorized" }, 401)
    const result = await mintTaskViewEmbedToken(config, username)
    if (!result.ok) {
      return c.json({ ok: false, error: result.error }, 502)
    }
    return c.json({
      ok: true,
      token: result.token,
      refreshToken: result.refreshToken,
      uiBaseUrl: result.uiBaseUrl,
      embedTokenParam: Buffer.from(result.token, "utf8").toString("base64"),
      embedRefreshParam: result.refreshToken
        ? Buffer.from(result.refreshToken, "utf8").toString("base64")
        : undefined,
    })
  })

  app.get("/bi/embed-session", async (c) => {
    const session = c.get("session")
    const username = session?.username
    if (!username) return c.json({ ok: false, error: "Unauthorized" }, 401)
    const result = await mintSupersetEmbedToken(config, username)
    if (!result.ok) {
      return c.json({ ok: false, error: result.error }, 502)
    }
    return c.json({
      ok: true,
      token: result.token,
      uiBaseUrl: result.uiBaseUrl,
      embedTokenParam: Buffer.from(result.token, "utf8").toString("base64"),
    })
  })

  // Optional Superset API proxy (Bearer from embed cache / platform-sso)
  app.all("/bi/*", async (c) => {
    if (c.req.path.endsWith("/embed-session")) return c.notFound()
    const session = c.get("session")
    const username = session?.username
    if (!username) return c.json({ error: "Unauthorized" }, 401)
    const minted = await mintSupersetEmbedToken(config, username)
    if (!minted.ok) return c.json({ error: minted.error }, 502)
    const target = `${config.subsystems.superset.apiBaseUrl}${c.req.path.replace("/api/bi", "")}`
    const req = new Request(target, c.req.raw)
    req.headers.set("Authorization", `Bearer ${minted.token}`)
    req.headers.delete("cookie")
    const res = await fetch(req)
    return new Response(res.body, { status: res.status, headers: res.headers })
  })

  app.get("/agent/embed-session", async (c) => {
    const session = c.get("session")
    const username = session?.username
    if (!username) return c.json({ ok: false, error: "Unauthorized" }, 401)
    const result = await mintBuildingAiEmbedToken(config, username)
    if (!result.ok) {
      return c.json({ ok: false, error: result.error }, 502)
    }
    const embedTokenParam = Buffer.from(result.token, "utf8").toString("base64")
    return c.json({
      ok: true,
      token: result.token,
      expiresAt: result.expiresAt,
      uiBaseUrl: result.uiBaseUrl,
      embedTokenParam,
    })
  })

  app.all("/agent/*", async (c) => {
    const userId = String(getPlatformUserId(c))
    const token = await ensureBuildingAiToken(userId, config)
    const target = `${config.subsystems.buildingai.baseUrl}${c.req.path.replace("/api/agent", "")}`
    const req = new Request(target, c.req.raw)
    req.headers.set("Authorization", `Bearer ${token}`)
    req.headers.delete("cookie")
    const res = await fetch(req)
    return new Response(res.body, { status: res.status, headers: res.headers })
  })

  return app
}

async function ensureBuildingAiToken(userId: string, config: GatewayConfig): Promise<string> {
  const cached = await getToken(userId, "buildingai")
  if (cached) return cached
  const token = await generateBuildingAiToken(userId, config)
  await setToken(userId, "buildingai", token, 3600)
  return token
}

async function generateBuildingAiToken(userId: string, config: GatewayConfig): Promise<string> {
  const response = await fetch(`${config.subsystems.buildingai.apiBaseUrl}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: config.subsystems.buildingai.apiKey,
      userId,
    }),
  })
  if (!response.ok) {
    throw new Error(`BuildingAI token generation failed: ${response.status}`)
  }
  const data = (await response.json()) as { data?: string; token?: string }
  return data.data || data.token || ""
}
