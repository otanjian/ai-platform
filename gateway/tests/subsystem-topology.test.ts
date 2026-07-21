import { describe, expect, test } from "bun:test"
import { parseSubsystemsConfig } from "../src/config.ts"

describe("subsystem topology config", () => {
  test("does not expose dataease and requires taskview/superset", () => {
    const subsystems = parseSubsystemsConfig({
      // Legacy key in raw YAML must be ignored if present
      ...( {
        dataease: {
          baseUrl: "http://localhost:8100",
          clientId: "dataease-proxy",
          clientSecret: "secret",
        },
      } as Record<string, unknown>),
    })

    expect("dataease" in subsystems).toBe(false)
    expect(subsystems.taskview.webBaseUrl).toContain("5174")
    // UI stays on localhost (same-site iframe with platform); API uses 127.0.0.1
    // so mint/proxy stay on IPv4 while cookies match platform hostname.
    expect(subsystems.superset.baseUrl).toBe("http://localhost:9060")
    expect(subsystems.superset.apiBaseUrl).toBe("http://127.0.0.1:9068")
    // UI stays on localhost (same-site iframe with platform); API uses 127.0.0.1
    // so macOS localhost→::1 cannot hit a foreign IPv6 :4090 listener.
    expect(subsystems.buildingai.baseUrl).toBe("http://localhost:4091")
    expect(subsystems.buildingai.apiBaseUrl).toBe("http://127.0.0.1:4090")
    expect(subsystems.opencode.baseUrl).toBeTruthy()
  })
})
