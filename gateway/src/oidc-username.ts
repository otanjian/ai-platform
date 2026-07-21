import type { KeycloakAdminClient } from "./keycloak.js"
import type { OidcUserInfo } from "./oidc.js"

/**
 * Resolve the platform login name from OIDC userinfo.
 * When Keycloak omits profile scope, preferred_username is missing and `sub`
 * may be a stable id (e.g. user-admin) that subsystems do not recognize.
 */
export async function resolveOidcUsername(
  userInfo: OidcUserInfo,
  keycloakAdmin: KeycloakAdminClient,
): Promise<string> {
  const preferred = userInfo.preferred_username?.trim()
  if (preferred) return preferred

  try {
    const user = await keycloakAdmin.getUserById(userInfo.sub)
    const fromKc = user?.username?.trim()
    if (fromKc) return fromKc
  } catch {
    // fall through to sub
  }

  return userInfo.sub
}

/** Resolve embed SSO login for an existing session (fixes stale sub-as-username cookies). */
export async function resolveSessionLogin(
  session: { username: string; oidc?: { sub: string; username: string } },
  keycloakAdmin: KeycloakAdminClient,
): Promise<string> {
  const candidate = session.username?.trim() || session.oidc?.username?.trim()
  if (candidate && session.oidc?.sub && candidate === session.oidc.sub) {
    try {
      const user = await keycloakAdmin.getUserById(session.oidc.sub)
      const fromKc = user?.username?.trim()
      if (fromKc) return fromKc
    } catch {
      // keep candidate
    }
  }
  return candidate || session.oidc?.sub || ""
}
