import type { GatewayConfig } from "./types.js"

export type SyncResult =
  | { ok: true; action: "created" | "password_reset" | "skipped"; username: string }
  | { ok: false; error: string }

/** Register or activate TaskView user via trusted platform-provision (no email confirm gate). */
export async function syncUserToTaskView(
  config: GatewayConfig,
  input: { username: string; password: string; email?: string },
): Promise<SyncResult> {
  const tv = config.subsystems.taskview
  const secret = tv.platformSsoSecret
  if (!secret) {
    return { ok: false, error: "TaskView platformSsoSecret is not configured" }
  }
  const apiBase = tv.apiBaseUrl.replace(/\/$/, "")
  const login = input.username.trim().toLowerCase()
  const email = input.email || `${login}@aiplatform.local`
  try {
    const response = await fetch(`${apiBase}/module/auth/platform-provision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login,
        email,
        password: input.password,
        secret,
      }),
    })
    const body = (await response.json().catch(() => ({}))) as {
      ok?: boolean
      action?: "created" | "password_reset" | "skipped"
      username?: string
      message?: string
    }
    if (!response.ok || !body.ok) {
      return {
        ok: false,
        error: body.message || `TaskView platform-provision failed: ${response.status}`,
      }
    }
    return {
      ok: true,
      action: body.action || "created",
      username: body.username || login,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
