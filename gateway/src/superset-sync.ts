import type { GatewayConfig } from "./types.js"

export type SyncResult =
  | { ok: true; action: "created" | "password_reset" | "skipped"; username: string }
  | { ok: false; error: string }

/**
 * Provision Superset user via admin security API when available.
 * Pass `isAdmin: true` to assign the Superset Admin role (id=1); otherwise Public (id=2).
 */
export async function syncUserToSuperset(
  config: GatewayConfig,
  input: { username: string; password: string; email?: string; isAdmin?: boolean },
): Promise<SyncResult> {
  const ss = config.subsystems.superset
  const apiBase = ss.apiBaseUrl.replace(/\/$/, "")
  const username = input.username.trim()
  const email = input.email || `${username}@aiplatform.local`
  const roleIds = input.isAdmin ? [1] : [2]
  try {
    const loginRes = await fetch(`${apiBase}/api/v1/security/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: ss.adminUsername,
        password: ss.adminPassword,
        provider: "db",
        refresh: true,
      }),
    })
    if (!loginRes.ok) {
      return { ok: false, error: `Superset admin login failed: ${loginRes.status}` }
    }
    const loginBody = (await loginRes.json()) as { access_token?: string }
    if (!loginBody.access_token) {
      return { ok: false, error: "Superset admin login returned no access_token" }
    }
    const token = loginBody.access_token

    // If user already exists, optionally promote to Admin and treat as skipped/password_reset
    const findRes = await fetch(
      `${apiBase}/api/v1/security/users/?q=(filters:!((col:username,opr:eq,value:${encodeURIComponent(username)})))`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (findRes.ok) {
      const found = (await findRes.json()) as {
        result?: Array<{ id: number; roles?: Array<{ id: number; name: string }> }>
      }
      const existing = found.result?.[0]
      if (existing) {
        if (input.isAdmin) {
          const putRes = await fetch(`${apiBase}/api/v1/security/users/${existing.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              roles: roleIds,
              active: true,
            }),
          })
          if (!putRes.ok && putRes.status !== 200) {
            const text = await putRes.text()
            return { ok: false, error: text || `Superset promote admin failed: ${putRes.status}` }
          }
        }
        return { ok: true, action: "skipped", username }
      }
    }

    const createRes = await fetch(`${apiBase}/api/v1/security/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        first_name: username,
        last_name: "platform",
        email,
        active: true,
        password: input.password,
        roles: roleIds,
      }),
    })
    if (createRes.ok || createRes.status === 201) {
      return { ok: true, action: "created", username }
    }
    if (createRes.status === 422 || createRes.status === 400) {
      return { ok: true, action: "skipped", username }
    }
    const text = await createRes.text()
    return { ok: false, error: text || `Superset user create failed: ${createRes.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
