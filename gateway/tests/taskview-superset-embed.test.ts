import { describe, expect, test } from "bun:test"
import { buildTaskViewEmbedUrl } from "../src/taskview-embed.ts"
import { buildSupersetEmbedUrl } from "../src/superset-embed.ts"

describe("embed URL builders", () => {
  test("TaskView URL includes _t and optional _r", () => {
    const url = buildTaskViewEmbedUrl("http://localhost:5174", "/", "access-token", "refresh-token")
    const u = new URL(url)
    expect(u.origin).toBe("http://localhost:5174")
    expect(u.searchParams.get("_t")).toBe(Buffer.from("access-token", "utf8").toString("base64"))
    expect(u.searchParams.get("_r")).toBe(Buffer.from("refresh-token", "utf8").toString("base64"))
  })

  test("Superset URL includes _t", () => {
    const url = buildSupersetEmbedUrl("http://127.0.0.1:9060", "/dashboard/list/", "jwt-here")
    const u = new URL(url)
    expect(u.pathname).toBe("/dashboard/list/")
    expect(u.searchParams.get("_t")).toBe(Buffer.from("jwt-here", "utf8").toString("base64"))
  })
})
