import { describe, expect, it, mock } from "bun:test"
import { resolveOidcUsername, resolveSessionLogin } from "../src/oidc-username.ts"
import type { KeycloakAdminClient } from "../src/keycloak.ts"
import type { OidcUserInfo } from "../src/oidc.ts"

describe("resolveOidcUsername", () => {
  it("prefers preferred_username when present", async () => {
    const userInfo: OidcUserInfo = { sub: "user-admin", preferred_username: "admin" }
    const kc = { getUserById: mock(() => Promise.resolve(null)) } as unknown as KeycloakAdminClient
    await expect(resolveOidcUsername(userInfo, kc)).resolves.toBe("admin")
    expect(kc.getUserById).not.toHaveBeenCalled()
  })

  it("falls back to Keycloak admin username when preferred_username is missing", async () => {
    const userInfo: OidcUserInfo = { sub: "user-admin" }
    const kc = {
      getUserById: mock(() =>
        Promise.resolve({
          id: "user-admin",
          username: "admin",
          enabled: true,
          email: "admin@aiplatform.local",
        }),
      ),
    } as unknown as KeycloakAdminClient
    await expect(resolveOidcUsername(userInfo, kc)).resolves.toBe("admin")
    expect(kc.getUserById).toHaveBeenCalledWith("user-admin")
  })

  it("falls back to sub when Keycloak lookup fails", async () => {
    const userInfo: OidcUserInfo = { sub: "user-admin" }
    const kc = {
      getUserById: mock(() => Promise.resolve(null)),
    } as unknown as KeycloakAdminClient
    await expect(resolveOidcUsername(userInfo, kc)).resolves.toBe("user-admin")
  })
})

describe("resolveSessionLogin", () => {
  it("maps stale sub-as-username sessions to Keycloak username", async () => {
    const kc = {
      getUserById: mock(() =>
        Promise.resolve({ id: "user-admin", username: "admin", enabled: true }),
      ),
    } as unknown as KeycloakAdminClient
    const login = await resolveSessionLogin(
      { username: "user-admin", oidc: { sub: "user-admin", username: "user-admin" } },
      kc,
    )
    expect(login).toBe("admin")
  })

  it("keeps normal usernames unchanged", async () => {
    const kc = { getUserById: mock(() => Promise.resolve(null)) } as unknown as KeycloakAdminClient
    const login = await resolveSessionLogin(
      { username: "admin", oidc: { sub: "user-admin", username: "admin" } },
      kc,
    )
    expect(login).toBe("admin")
    expect(kc.getUserById).not.toHaveBeenCalled()
  })
})