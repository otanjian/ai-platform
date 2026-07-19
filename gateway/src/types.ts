export type User = {
  username: string
  passwordHash: string
  projects: string[]
}

export type OidcConfig = {
  enabled: boolean
  issuer: string
  clientId: string
  redirectUri: string
  scopes: string[]
  groupMapping: Record<string, string>
}

export type KeycloakConfig = {
  url: string
  realm: string
  clientId: string
  clientSecret?: string
  adminUsername?: string
  adminPassword?: string
}

export type SubsystemConfig = {
  opencode: { baseUrl: string; authType: "none"; password?: string }
  dataease: { baseUrl: string; authType: "oidc"; clientId: string; clientSecret: string }
  buildingai: { baseUrl: string; authType: "token"; apiKey: string }
}

export type GatewayConfig = {
  port: number
  host: string
  frontendUrl: string
  publicUrl: string
  opencodeCommand: string
  opencodeArgs: string[]
  sandboxRoot: string
  idleTimeoutMs: number
  sessionSecret: string
  cookieName: string
  users: User[]
  adminUsers: string[]
  usersDataPath: string
  oidc: OidcConfig | null
  keycloak: KeycloakConfig
  subsystems: SubsystemConfig
  databaseUrl: string
  redisUrl: string
}

export type OidcSessionData = {
  sub: string
  username: string
  email?: string
  name?: string
  groups: string[]
  realmRoles: string[]
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

export type LocalSessionData = {
  username: string
}

export type Session = {
  username: string
  createdAt: number
  oidc?: OidcSessionData
}

export type UserProcess = {
  username: string
  port: number
  projectPath: string
  process: ReturnType<typeof import("bun").spawn>
  lastActivityAt: number
  startedAt: number
}

export type PlatformUser = {
  id: number
  keycloakUserId: string
  username: string
  email: string | null
  defaultRoleId: number | null
  createdAt: Date
  updatedAt: Date
}

export type MenuPermission = "none" | "read" | "write" | "admin"
