import { normalizeBuildingAiUsername } from "./buildingai-admin.js"
import type { GatewayConfig } from "./types.js"

export type EmbedSessionResult =
  | { ok: true; token: string; expiresAt?: string; uiBaseUrl: string; username: string }
  | { ok: false; error: string }

/** Mint BuildingAI JWT for username via trusted platform-sso. */
export async function mintBuildingAiEmbedToken(
  config: GatewayConfig,
  username: string,
): Promise<EmbedSessionResult> {
  const bai = config.subsystems.buildingai
  const secret = bai.platformSsoSecret
  if (!secret) {
    return { ok: false, error: "BuildingAI platformSsoSecret is not configured" }
  }
  const apiBase = bai.apiBaseUrl.replace(/\/$/, "")
  const baiUsername = normalizeBuildingAiUsername(username)
  try {
    const response = await fetch(`${apiBase}/api/auth/platform-sso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: baiUsername, secret, terminal: 1 }),
    })
    const body = (await response.json()) as {
      code?: number
      message?: string
      data?: { token?: string; expiresAt?: string }
    }
    if (!response.ok || body.code !== 20000 || !body.data?.token) {
      return {
        ok: false,
        error: body.message || `BuildingAI platform-sso failed: ${response.status}`,
      }
    }
    return {
      ok: true,
      token: body.data.token,
      expiresAt: body.data.expiresAt,
      uiBaseUrl: bai.baseUrl.replace(/\/$/, ""),
      username: baiUsername,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export function buildBuildingAiEmbedUrl(uiBaseUrl: string, path: string, token: string): string {
  const base = uiBaseUrl.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  const t = typeof btoa === "function" ? btoa(token) : Buffer.from(token, "utf8").toString("base64")
  return `${base}${p}?_t=${encodeURIComponent(t)}`
}
