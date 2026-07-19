import fs from "fs/promises"
import path from "path"
import os from "os"
import crypto from "crypto"
import yaml from "js-yaml"
import type { GatewayConfig, OidcConfig, KeycloakConfig, SubsystemConfig, User } from "./types"

const DEFAULT_CONFIG: Partial<GatewayConfig> = {
  port: 3001,
  host: "0.0.0.0",
  frontendUrl: "http://localhost:3000",
  publicUrl: "http://localhost:3001",
  opencodeCommand: "opencode",
  opencodeArgs: ["web", "--hostname", "0.0.0.0"],
  idleTimeoutMs: 30 * 60 * 1000,
  cookieName: "aiplatform_session",
  adminUsers: [],
  usersDataPath: "data/users.json",
  oidc: null,
  databaseUrl: "mysql://aiplatform:aiplatform@localhost:3306/aiplatform",
  redisUrl: "redis://localhost:6379",
}

export type RawConfig = {
  port?: number
  host?: string
  frontendUrl?: string
  publicUrl?: string
  opencodeCommand?: string
  opencodeArgs?: string[]
  sandboxRoot?: string
  idleTimeoutMs?: number
  sessionSecret?: string
  cookieName?: string
  adminUsers?: string[]
  usersDataPath?: string
  oidc?: {
    enabled?: boolean
    issuer?: string
    clientId?: string
    redirectUri?: string
    scopes?: string[]
    groupMapping?: Record<string, string>
  }
  keycloak?: {
    url?: string
    realm?: string
    clientId?: string
    clientSecret?: string
    adminUsername?: string
    adminPassword?: string
  }
  subsystems?: {
    opencode?: { baseUrl?: string; password?: string }
    dataease?: { baseUrl?: string; clientId?: string; clientSecret?: string }
    buildingai?: { baseUrl?: string; apiKey?: string }
  }
  users?: Array<{
    username: string
    password: string
    projects: string[]
  }>
  databaseUrl?: string
  redisUrl?: string
}

function resolveSandboxRoot(input?: string): string {
  if (input) {
    const expanded = input.startsWith("~/") ? path.join(os.homedir(), input.slice(2)) : input
    return path.resolve(expanded)
  }
  return path.join(os.homedir(), ".opencode-sandbox")
}

function validateUsers(users: User[] | undefined, oidcEnabled: boolean): User[] {
  if (!users || users.length === 0) {
    if (oidcEnabled) return []
    throw new Error("Configuration must contain at least one user")
  }
  for (const user of users) {
    if (!user.username || user.username.trim() === "") {
      throw new Error("Every user must have a non-empty username")
    }
    if (!user.passwordHash || user.passwordHash.trim() === "") {
      throw new Error(`User ${user.username} must have a password`)
    }
    if (!user.projects || user.projects.length === 0) {
      throw new Error(`User ${user.username} must have at least one project`)
    }
  }
  return users
}

export async function loadConfig(configPath?: string): Promise<GatewayConfig> {
  const targetPath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), "config.yaml")

  let raw: RawConfig = {}
  try {
    const content = await fs.readFile(targetPath, "utf-8")
    raw = yaml.load(content) as RawConfig
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT" && !configPath) {
      throw new Error("No config.yaml found in the current directory. Please create one.")
    }
    throw err
  }

  const sessionSecret = raw.sessionSecret || generateSessionSecret()
  const users: User[] = []
  for (const u of raw.users || []) {
    const passwordHash = u.password.startsWith("$2")
      ? u.password
      : await Bun.password.hash(u.password, { algorithm: "bcrypt" })
    users.push({
      username: u.username,
      passwordHash,
      projects: u.projects.map((p) => path.resolve(p)),
    })
  }
  const oidc = parseOidcConfig(raw.oidc)
  validateUsers(users, !!oidc)

  return {
    ...DEFAULT_CONFIG,
    port: raw.port ?? DEFAULT_CONFIG.port!,
    host: raw.host ?? DEFAULT_CONFIG.host!,
    frontendUrl: raw.frontendUrl ?? DEFAULT_CONFIG.frontendUrl!,
    publicUrl: raw.publicUrl ?? DEFAULT_CONFIG.publicUrl!,
    opencodeCommand: raw.opencodeCommand ?? DEFAULT_CONFIG.opencodeCommand!,
    opencodeArgs: raw.opencodeArgs ?? DEFAULT_CONFIG.opencodeArgs!,
    sandboxRoot: resolveSandboxRoot(raw.sandboxRoot),
    idleTimeoutMs: raw.idleTimeoutMs ?? DEFAULT_CONFIG.idleTimeoutMs!,
    sessionSecret,
    cookieName: raw.cookieName ?? DEFAULT_CONFIG.cookieName!,
    adminUsers: raw.adminUsers ?? DEFAULT_CONFIG.adminUsers!,
    usersDataPath: raw.usersDataPath ?? DEFAULT_CONFIG.usersDataPath!,
    oidc,
    keycloak: parseKeycloakConfig(raw.keycloak),
    subsystems: parseSubsystemsConfig(raw.subsystems),
    databaseUrl: raw.databaseUrl ?? DEFAULT_CONFIG.databaseUrl!,
    redisUrl: raw.redisUrl ?? DEFAULT_CONFIG.redisUrl!,
    users,
  }
}

function parseOidcConfig(raw?: RawConfig["oidc"]): OidcConfig | null {
  if (!raw || raw.enabled === false) return null
  if (!raw.issuer || !raw.clientId || !raw.redirectUri) {
    throw new Error("OIDC is enabled but missing issuer, clientId, or redirectUri")
  }
  return {
    enabled: true,
    issuer: raw.issuer,
    clientId: raw.clientId,
    redirectUri: raw.redirectUri,
    scopes: raw.scopes ?? ["openid", "profile", "email", "groups"],
    groupMapping: raw.groupMapping ?? {},
  }
}

function parseKeycloakConfig(raw?: RawConfig["keycloak"]): KeycloakConfig {
  return {
    url: raw?.url ?? "http://localhost:8080",
    realm: raw?.realm ?? "aiplatform",
    clientId: raw?.clientId ?? "gateway",
    clientSecret: raw?.clientSecret,
    adminUsername: raw?.adminUsername,
    adminPassword: raw?.adminPassword,
  }
}

function parseSubsystemsConfig(raw?: RawConfig["subsystems"]): SubsystemConfig {
  return {
    opencode: {
      baseUrl: raw?.opencode?.baseUrl ?? "http://localhost:4096",
      authType: "none",
      password: raw?.opencode?.password ?? "opencode",
    },
    dataease: {
      baseUrl: raw?.dataease?.baseUrl ?? "http://localhost:8100",
      authType: "oidc",
      clientId: raw?.dataease?.clientId ?? "dataease-proxy",
      clientSecret: raw?.dataease?.clientSecret ?? "dataease-proxy-secret",
    },
    buildingai: {
      baseUrl: raw?.buildingai?.baseUrl ?? "http://localhost:4091",
      authType: "token",
      apiKey: raw?.buildingai?.apiKey ?? "",
    },
  }
}

function generateSessionSecret(): string {
  return crypto.randomUUID() + crypto.randomUUID()
}
