import type { GatewayConfig } from "./types.js"

export type EmbedSessionResult =
  | { ok: true; token: string; refreshToken?: string; uiBaseUrl: string; username: string }
  | { ok: false; error: string }

/** Mint TaskView JWT via trusted platform-sso. */
export async function mintTaskViewEmbedToken(
  config: GatewayConfig,
  username: string,
): Promise<EmbedSessionResult> {
  const tv = config.subsystems.taskview
  const secret = tv.platformSsoSecret
  if (!secret) {
    return { ok: false, error: "TaskView platformSsoSecret is not configured" }
  }
  const apiBase = tv.apiBaseUrl.replace(/\/$/, "")
  const login = username.trim().toLowerCase()
  try {
    const response = await fetch(`${apiBase}/module/auth/platform-sso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, secret }),
    })
    const body = (await response.json().catch(() => null)) as {
      access?: string
      refresh?: string
      message?: string
    } | null
    if (!response.ok || !body?.access) {
      return {
        ok: false,
        error: body?.message || `TaskView platform-sso failed: ${response.status}`,
      }
    }
    return {
      ok: true,
      token: body.access,
      refreshToken: body.refresh,
      uiBaseUrl: tv.webBaseUrl.replace(/\/$/, ""),
      username: login,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export function buildTaskViewEmbedUrl(
  uiBaseUrl: string,
  path: string,
  accessToken: string,
  refreshToken?: string,
): string {
  const base = uiBaseUrl.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  const t = Buffer.from(accessToken, "utf8").toString("base64")
  const url = new URL(`${base}${p}`)
  url.searchParams.set("_t", t)
  if (refreshToken) {
    url.searchParams.set("_r", Buffer.from(refreshToken, "utf8").toString("base64"))
  }
  return url.toString()
}
