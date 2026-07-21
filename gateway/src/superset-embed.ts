import type { GatewayConfig } from "./types.js"

export type EmbedSessionResult =
  | { ok: true; token: string; uiBaseUrl: string; username: string }
  | { ok: false; error: string }

/** Mint Superset access_token via trusted platform-sso. */
export async function mintSupersetEmbedToken(
  config: GatewayConfig,
  username: string,
): Promise<EmbedSessionResult> {
  const ss = config.subsystems.superset
  const secret = ss.platformSsoSecret
  if (!secret) {
    return { ok: false, error: "Superset platformSsoSecret is not configured" }
  }
  const apiBase = ss.apiBaseUrl.replace(/\/$/, "")
  try {
    const response = await fetch(`${apiBase}/api/v1/security/platform-sso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, secret }),
    })
    const body = (await response.json()) as {
      access_token?: string
      message?: string
      msg?: string
    }
    if (!response.ok || !body.access_token) {
      return {
        ok: false,
        error: body.message || body.msg || `Superset platform-sso failed: ${response.status}`,
      }
    }
    return {
      ok: true,
      token: body.access_token,
      uiBaseUrl: ss.baseUrl.replace(/\/$/, ""),
      username,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export function buildSupersetEmbedUrl(uiBaseUrl: string, path: string, token: string): string {
  const base = uiBaseUrl.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  const t = Buffer.from(token, "utf8").toString("base64")
  const url = new URL(`${base}${p}`)
  url.searchParams.set("_t", t)
  return url.toString()
}
