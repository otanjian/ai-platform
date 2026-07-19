import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import fs from "fs/promises"
import fsSync from "fs"
import path from "path"
import os from "os"
import { AuthManager } from "../src/auth"
import { ProcessManager } from "../src/opencode"
import { UserStore } from "../src/user-store"
import { loadConfig } from "../src/config"
import { extractGroups, mapGroupsToProjects, OidcClient } from "../src/oidc"
import type { GatewayConfig } from "../src/types"

describe("AuthManager", () => {
  let auth: AuthManager
  let userStore: UserStore
  let config: GatewayConfig

  beforeEach(async () => {
    config = {
      port: 9090,
      host: "127.0.0.1",
      opencodeCommand: "echo",
      opencodeArgs: [],
      sandboxRoot: path.join(os.tmpdir(), "opencode-test-" + Date.now()),
      idleTimeoutMs: 1000,
      sessionSecret: "test-secret",
      cookieName: "test_session",
      adminUsers: ["alice"],
      usersDataPath: path.join(os.tmpdir(), `users-${Date.now()}.json`),
      oidc: null,
      users: [
        {
          username: "alice",
          passwordHash: await Bun.password.hash("alice-pass", { algorithm: "bcrypt" }),
          projects: ["/tmp/project-a"],
        },
      ],
    }
    auth = new AuthManager(config)
    userStore = new UserStore(config.usersDataPath, config.users)
  })

  afterEach(async () => {
    await fs.rm(config.sandboxRoot, { recursive: true, force: true }).catch(() => {})
    await fs.rm(config.usersDataPath, { recursive: true, force: true }).catch(() => {})
  })

  it("verifies correct password", async () => {
    const user = await auth.verifyLocalPassword("alice", "alice-pass", userStore)
    expect(user).not.toBeNull()
    expect(user?.username).toBe("alice")
  })

  it("rejects wrong password", async () => {
    const user = await auth.verifyLocalPassword("alice", "wrong-pass", userStore)
    expect(user).toBeNull()
  })

  it("rejects unknown user", async () => {
    const user = await auth.verifyLocalPassword("bob", "any-pass", userStore)
    expect(user).toBeNull()
  })

  it("detects admin users", () => {
    expect(auth.isAdmin("alice")).toBe(true)
    expect(auth.isAdmin("bob")).toBe(false)
  })

  it("creates and parses a valid session token", () => {
    const token = auth.createSessionToken({ username: "alice" })
    const session = auth.parseSessionToken(token)
    expect(session?.username).toBe("alice")
  })

  it("rejects a tampered session token", () => {
    const token = auth.createSessionToken({ username: "alice" })
    const [encodedPayload, signature] = token.split(".")
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"))
    payload.username = "bob"
    const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
    const tampered = `${tamperedPayload}.${signature}`
    const session = auth.parseSessionToken(tampered)
    expect(session).toBeNull()
  })
})

describe("ProcessManager", () => {
  let manager: ProcessManager
  let config: GatewayConfig

  beforeEach(async () => {
    const bunPath = fsSync.realpathSync(Bun.which("bun") || "bun")
    const sandboxRoot = path.join(os.tmpdir(), "opencode-test-" + Date.now())
    config = {
      port: 9090,
      host: "127.0.0.1",
      opencodeCommand: bunPath,
      opencodeArgs: [path.resolve(__dirname, "mock-opencode.ts")],
      sandboxRoot,
      idleTimeoutMs: 50,
      sessionSecret: "test-secret",
      cookieName: "test_session",
      adminUsers: [],
      usersDataPath: path.join(os.tmpdir(), `users-${Date.now()}.json`),
      oidc: null,
      users: [],
    }
    manager = new ProcessManager(config)
    manager.startIdleChecker()
  })

  afterEach(async () => {
    manager.stopIdleChecker()
    await manager.stopAll()
    await fs.rm(config.sandboxRoot, { recursive: true, force: true }).catch(() => {})
  })

  it("starts a process and assigns a unique port", async () => {
    const proc = await manager.getOrStartProcess("alice", "/tmp/project-a")
    expect(proc.port).toBeGreaterThan(0)
    expect(proc.username).toBe("alice")
    expect(proc.projectPath).toBe("/tmp/project-a")

    const response = await fetch(`http://127.0.0.1:${proc.port}/`)
    expect(await response.text()).toBe("mock-opencode")
  })

  it("creates isolated XDG directories per user", async () => {
    await manager.getOrStartProcess("alice", "/tmp/project-a")
    const userDir = path.join(config.sandboxRoot, "users", "alice")
    await expect(fs.stat(path.join(userDir, "data")).then((s) => s.isDirectory())).resolves.toBe(true)
    await expect(fs.stat(path.join(userDir, "config")).then((s) => s.isDirectory())).resolves.toBe(true)
    await expect(fs.stat(path.join(userDir, "state")).then((s) => s.isDirectory())).resolves.toBe(true)
    await expect(fs.stat(path.join(userDir, "cache")).then((s) => s.isDirectory())).resolves.toBe(true)
    await expect(fs.stat(path.join(userDir, "tmp")).then((s) => s.isDirectory())).resolves.toBe(true)
  })

  it("shuts down idle processes", async () => {
    const proc = await manager.getOrStartProcess("alice", "/tmp/project-a")
    const port = proc.port

    await new Promise((resolve) => setTimeout(resolve, 100))
    await manager.checkIdleNow()

    const stillRunning = manager.getProcess("alice")
    expect(stillRunning).toBeUndefined()

    await expect(
      fetch(`http://127.0.0.1:${port}/`).then(
        () => true,
        () => false,
      ),
    ).resolves.toBe(false)
  })
})

describe("UserStore", () => {
  let store: UserStore
  let filePath: string

  beforeEach(async () => {
    filePath = path.join(os.tmpdir(), `userstore-${Date.now()}.json`)
    store = new UserStore(filePath, [
      { username: "alice", passwordHash: "hash", projects: ["/tmp/project-a"] },
    ])
  })

  afterEach(async () => {
    await fs.rm(filePath, { recursive: true, force: true }).catch(() => {})
  })

  it("adds and retrieves users", async () => {
    await store.addUser({ username: "bob", passwordHash: "hash2", projects: ["/tmp/project-b"] })
    expect(store.getUser("bob")?.username).toBe("bob")
    expect(store.getUser("bob")?.projects).toEqual(["/tmp/project-b"])
  })

  it("prevents duplicate users", async () => {
    await expect(
      store.addUser({ username: "alice", passwordHash: "hash", projects: [] }),
    ).rejects.toThrow("already exists")
  })

  it("removes users", async () => {
    await store.removeUser("alice")
    expect(store.getUser("alice")).toBeUndefined()
  })

  it("manages project pool", async () => {
    await store.addProject("/tmp/project-new")
    expect(store.getProjects()).toContain("/tmp/project-new")
    await store.removeProject("/tmp/project-new")
    expect(store.getProjects()).not.toContain("/tmp/project-new")
  })

  it("updates user projects", async () => {
    await store.setUserProjects("alice", ["/tmp/project-x", "/tmp/project-y"])
    expect(store.getUser("alice")?.projects).toEqual(["/tmp/project-x", "/tmp/project-y"])
  })
})

describe("loadConfig", () => {
  it("loads a valid config file and hashes plaintext passwords", async () => {
    const configPath = path.join(os.tmpdir(), `opencode-config-${Date.now()}.yaml`)
    await fs.writeFile(
      configPath,
      `
port: 9090
sandboxRoot: /tmp/opencode-sandbox-test
adminUsers:
  - alice
usersDataPath: /tmp/test-users.json
users:
  - username: alice
    password: secret
    projects:
      - /tmp/project-a
`,
    )

    const config = await loadConfig(configPath)
    expect(config.port).toBe(9090)
    expect(config.adminUsers).toEqual(["alice"])
    expect(config.usersDataPath).toBe("/tmp/test-users.json")
    expect(config.users[0].username).toBe("alice")
    expect(config.users[0].passwordHash).not.toBe("secret")
    expect(await Bun.password.verify("secret", config.users[0].passwordHash)).toBe(true)
    expect(config.users[0].projects).toEqual(["/tmp/project-a"])

    await fs.unlink(configPath)
  })
})

describe("OIDC helpers", () => {
  it("extracts groups from userinfo", () => {
    expect(extractGroups({ sub: "x", groups: ["a", "b"] })).toEqual(["a", "b"])
    expect(extractGroups({ sub: "x", groups: "a" })).toEqual(["a"])
    expect(extractGroups({ sub: "x" })).toEqual([])
  })

  it("maps groups to projects", () => {
    const mapping = { "project-a": "/tmp/a", "project-b": "/tmp/b" }
    expect(mapGroupsToProjects(["project-a"], mapping)).toEqual(["/tmp/a"])
    expect(mapGroupsToProjects(["project-a", "project-b", "unknown"], mapping)).toEqual([
      "/tmp/a",
      "/tmp/b",
    ])
  })
})

describe("OidcClient", () => {
  const oidcConfig = {
    enabled: true,
    issuer: "http://localhost:9091/realms/opencode",
    clientId: "gateway",
    redirectUri: "http://localhost:9090/auth/callback",
    scopes: ["openid", "profile", "email", "groups"],
    groupMapping: {},
  }

  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  function mockDiscovery() {
    global.fetch = (async () => {
      return new Response(
        JSON.stringify({
          authorization_endpoint: "http://localhost:9091/realms/opencode/protocol/openid-connect/auth",
          token_endpoint: "http://localhost:9091/realms/opencode/protocol/openid-connect/token",
          userinfo_endpoint: "http://localhost:9091/realms/opencode/protocol/openid-connect/userinfo",
          end_session_endpoint: "http://localhost:9091/realms/opencode/protocol/openid-connect/logout",
          issuer: "http://localhost:9091/realms/opencode",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    }) as typeof fetch
  }

  it("creates an authorization URL with PKCE", async () => {
    mockDiscovery()
    const client = new OidcClient(oidcConfig)
    const state = client.createAuthorizationUrl()
    expect(state.state).toBeDefined()
    expect(state.codeVerifier).toBeDefined()

    const url = await client.buildAuthorizationRedirectUrl(state)
    expect(url).toContain("http://localhost:9091/realms/opencode/protocol/openid-connect/auth")
    expect(url).toContain("client_id=gateway")
    expect(url).toContain("response_type=code")
    expect(url).toContain("code_challenge=")
    expect(url).toContain("code_challenge_method=S256")
  })
})

