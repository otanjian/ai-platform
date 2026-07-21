import { describe, expect, it, mock, beforeEach } from "bun:test"
import {
  isValidBuildingAiPassword,
  normalizeBuildingAiUsername,
  BuildingAiAdminClient,
} from "../src/buildingai-admin"

describe("normalizeBuildingAiUsername", () => {
  it("replaces hyphens with underscores", () => {
    expect(normalizeBuildingAiUsername("user-admin")).toBe("user_admin")
  })
})

describe("isValidBuildingAiPassword", () => {
  it("accepts 6-20 chars with letter and digit", () => {
    expect(isValidBuildingAiPassword("Rock123")).toBe(true)
    expect(isValidBuildingAiPassword("abc123")).toBe(true)
  })

  it("rejects too short, too long, letter-only, digit-only", () => {
    expect(isValidBuildingAiPassword("ab12")).toBe(false)
    expect(isValidBuildingAiPassword("a".repeat(21) + "1")).toBe(false)
    expect(isValidBuildingAiPassword("abcdef")).toBe(false)
    expect(isValidBuildingAiPassword("123456")).toBe(false)
  })
})

describe("BuildingAiAdminClient", () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []

  beforeEach(() => {
    calls.length = 0
    mock.restore()
  })

  it("logs in then creates user with same username and password", async () => {
    const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url)
      calls.push({ url: u, init })
      if (u.endsWith("/api/auth/login")) {
        return new Response(JSON.stringify({ code: 20000, data: { token: "tok_abc" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (u.includes("/consoleapi/users") && init?.method === "POST") {
        return new Response(JSON.stringify({ code: 20000, data: { id: "u1", username: "alice" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response("not found", { status: 404 })
    })
    // @ts-expect-error test double
    globalThis.fetch = fetchMock

    const client = new BuildingAiAdminClient({
      apiBaseUrl: "http://127.0.0.1:4090",
      adminUsername: "Rock",
      adminPassword: "Rock123",
    })
    await client.createUser({ username: "alice", password: "Alice12", email: "a@b.com" })

    expect(calls[0]?.url).toBe("http://127.0.0.1:4090/api/auth/login")
    const loginBody = JSON.parse(String(calls[0]?.init?.body))
    expect(loginBody).toEqual({ username: "Rock", password: "Rock123", terminal: 1 })

    expect(calls[1]?.url).toBe("http://127.0.0.1:4090/consoleapi/users")
    expect(calls[1]?.init?.headers).toMatchObject({ Authorization: "Bearer tok_abc" })
    const createBody = JSON.parse(String(calls[1]?.init?.body))
    expect(createBody.username).toBe("alice")
    expect(createBody.password).toBe("Alice12")
  })

  it("finds user by username then resets password", async () => {
    const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
      const u = String(url)
      calls.push({ url: u, init })
      if (u.endsWith("/api/auth/login")) {
        return new Response(JSON.stringify({ code: 20000, data: { token: "tok_abc" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (u.includes("/consoleapi/users?") && (!init?.method || init.method === "GET")) {
        return new Response(
          JSON.stringify({
            code: 20000,
            data: { items: [{ id: "uid-9", username: "alice" }], total: 1 },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }
      if (u.includes("/consoleapi/users/reset-password/uid-9")) {
        return new Response(JSON.stringify({ code: 20000, data: { id: "uid-9" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response("not found", { status: 404 })
    })
    // @ts-expect-error test double
    globalThis.fetch = fetchMock

    const client = new BuildingAiAdminClient({
      apiBaseUrl: "http://127.0.0.1:4090",
      adminUsername: "Rock",
      adminPassword: "Rock123",
    })
    await client.resetPasswordByUsername("alice", "NewPass1")

    expect(calls.some((c) => c.url.includes("/consoleapi/users/reset-password/uid-9"))).toBe(true)
    const resetCall = calls.find((c) => c.url.includes("reset-password"))
    expect(JSON.parse(String(resetCall?.init?.body))).toEqual({ password: "NewPass1" })
  })
})
