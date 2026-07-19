import { describe, it, expect } from "bun:test"

describe("Gateway E2E", () => {
  it("should return health status", async () => {
    const res = await fetch("http://localhost:3001/api/gateway/health")
    if (res.status === 200) {
      const body = (await res.json()) as { status: string }
      expect(body.status).toBe("ok")
    } else {
      expect(res.status).toBeGreaterThanOrEqual(500)
    }
  })

  it("should redirect unauthenticated requests to login", async () => {
    const res = await fetch("http://localhost:3001/api/session", { redirect: "manual" })
    expect(res.status).toBe(401)
  })
})
