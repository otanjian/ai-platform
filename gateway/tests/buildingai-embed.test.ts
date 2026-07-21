import { describe, expect, it, mock, beforeEach } from "bun:test"
import { buildBuildingAiEmbedUrl, mintBuildingAiEmbedToken } from "../src/buildingai-embed"
import type { GatewayConfig } from "../src/types"

function minimalConfig(overrides?: Partial<GatewayConfig["subsystems"]["buildingai"]>): GatewayConfig {
  return {
    subsystems: {
      opencode: { baseUrl: "http://localhost:4096", authType: "none" },
      dataease: {
        baseUrl: "http://localhost:8100",
        authType: "oidc",
        clientId: "x",
        clientSecret: "y",
      },
      taskview: {
        webBaseUrl: "http://localhost:5174",
        apiBaseUrl: "http://localhost:1401",
        authType: "token",
        adminUsername: "user",
        adminPassword: "pass",
        platformSsoSecret: "tv-secret",
      },
      superset: {
        baseUrl: "http://127.0.0.1:9060",
        apiBaseUrl: "http://127.0.0.1:9068",
        authType: "token",
        adminUsername: "admin",
        adminPassword: "admin",
        platformSsoSecret: "ss-secret",
      },
      buildingai: {
        baseUrl: "http://127.0.0.1:4091",
        apiBaseUrl: "http://127.0.0.1:4090",
        authType: "token",
        apiKey: "",
        adminUsername: "Rock",
        adminPassword: "Rock123",
        platformSsoSecret: "test-secret",
        ...overrides,
      },
    },
  } as GatewayConfig
}

describe("buildBuildingAiEmbedUrl", () => {
  it("appends base64 _t query param", () => {
    const url = buildBuildingAiEmbedUrl("http://127.0.0.1:4091", "/agents", "tok_abc")
    expect(url.startsWith("http://127.0.0.1:4091/agents?_t=")).toBe(true)
    const encoded = new URL(url).searchParams.get("_t")!
    expect(atob(decodeURIComponent(encoded))).toBe("tok_abc")
  })
})

describe("mintBuildingAiEmbedToken", () => {
  beforeEach(() => {
    mock.restore()
  })

  it("calls platform-sso with username and secret", async () => {
    const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe("http://127.0.0.1:4090/api/auth/platform-sso")
      const body = JSON.parse(String(init?.body))
      expect(body).toEqual({ username: "alice", secret: "test-secret", terminal: 1 })
      return new Response(
        JSON.stringify({ code: 20000, data: { token: "jwt_1", expiresAt: "2099-01-01" } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    })
    // @ts-expect-error test double
    globalThis.fetch = fetchMock

    const result = await mintBuildingAiEmbedToken(minimalConfig(), "alice")
    expect(result).toEqual({
      ok: true,
      token: "jwt_1",
      expiresAt: "2099-01-01",
      uiBaseUrl: "http://127.0.0.1:4091",
      username: "alice",
    })
  })

  it("normalizes hyphenated usernames before SSO", async () => {
    const fetchMock = mock(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body))
      expect(body.username).toBe("user_admin")
      return new Response(
        JSON.stringify({ code: 20000, data: { token: "jwt_2" } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    })
    // @ts-expect-error test double
    globalThis.fetch = fetchMock

    const result = await mintBuildingAiEmbedToken(minimalConfig(), "user-admin")
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.username).toBe("user_admin")
  })

  it("returns error when BuildingAI rejects", async () => {
    const fetchMock = mock(async () => {
      return new Response(JSON.stringify({ code: 40200, message: "Invalid platform SSO secret" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    })
    // @ts-expect-error test double
    globalThis.fetch = fetchMock

    const result = await mintBuildingAiEmbedToken(minimalConfig(), "alice")
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain("Invalid platform SSO secret")
  })
})
