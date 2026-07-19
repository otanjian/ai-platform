import { Hono } from "hono"
import { getPlatformUserId } from "../permissions.js"
import { getToken, setToken } from "../db/redis.js"
import { db } from "../db/db.js"
import * as schema from "../db/schema.js"
import { eq } from "drizzle-orm"
import { proxyHttp } from "../proxy.js"
import type { GatewayConfig } from "../types.js"

export function triSystemRouter(config: GatewayConfig) {
  const app = new Hono()

  // OpenCode proxy: no auth required, just pass through
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

  // DataEase proxy: inject X-DE-TOKEN
  app.all("/bi/*", async (c) => {
    const userId = String(getPlatformUserId(c))
    const token = await ensureDataEaseToken(userId, config)
    const target = `${config.subsystems.dataease.baseUrl}${c.req.path.replace("/api/bi", "")}`
    const req = new Request(target, c.req.raw)
    req.headers.set("X-DE-TOKEN", token)
    req.headers.delete("cookie")
    const res = await fetch(req)
    return new Response(res.body, { status: res.status, headers: res.headers })
  })

  // BuildingAI proxy: inject Authorization Bearer
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

async function ensureDataEaseToken(userId: string, config: GatewayConfig): Promise<string> {
  const cached = await getToken(userId, "dataease")
  if (cached) return cached
  const token = await exchangeDataEaseToken(config)
  await setToken(userId, "dataease", token, 3600)
  return token
}

async function ensureBuildingAiToken(userId: string, config: GatewayConfig): Promise<string> {
  const cached = await getToken(userId, "buildingai")
  if (cached) return cached
  const token = await generateBuildingAiToken(userId, config)
  await setToken(userId, "buildingai", token, 3600)
  return token
}

async function exchangeDataEaseToken(config: GatewayConfig): Promise<string> {
  // Placeholder: implement OIDC proxy terminal exchange per DataEase X-DE-TOKEN spec
  const response = await fetch(`${config.subsystems.dataease.baseUrl}/api/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: config.subsystems.dataease.clientId,
      clientSecret: config.subsystems.dataease.clientSecret,
    }),
  })
  if (!response.ok) {
    throw new Error(`DataEase token exchange failed: ${response.status}`)
  }
  const data = (await response.json()) as { data?: string; token?: string }
  return data.data || data.token || ""
}

async function generateBuildingAiToken(userId: string, config: GatewayConfig): Promise<string> {
  // Placeholder: implement JIT provisioning and JWT exchange with BuildingAI
  const response = await fetch(`${config.subsystems.buildingai.baseUrl}/api/v1/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.subsystems.buildingai.apiKey,
    },
    body: JSON.stringify({ externalUserId: userId, source: "aiplatform" }),
  })
  if (!response.ok) {
    throw new Error(`BuildingAI token exchange failed: ${response.status}`)
  }
  const data = (await response.json()) as { data?: { token?: string } }
  return data.data?.token || ""
}
