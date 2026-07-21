export type BuildingAiAdminConfig = {
  apiBaseUrl: string
  adminUsername: string
  adminPassword: string
}

export type BuildingAiCreateUserInput = {
  username: string
  password: string
  email?: string
  nickname?: string
}

/** BuildingAI CreateUserDto: 6–20 chars, must contain letter and digit. */
export function isValidBuildingAiPassword(password: string): boolean {
  if (password.length < 6 || password.length > 20) return false
  return /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(password)
}

/**
 * BuildingAI usernames: 3–20 chars, letters/digits/underscore only.
 * Map Keycloak names like `user-admin` → `user_admin`.
 */
export function normalizeBuildingAiUsername(username: string): string {
  let normalized = username.replace(/[^a-zA-Z0-9_]/g, "_")
  if (normalized.length < 3) normalized = `${normalized}_user`
  if (normalized.length > 20) normalized = normalized.slice(0, 20)
  return normalized
}

type ApiEnvelope<T> = {
  code: number
  message?: string
  data?: T
}

export class BuildingAiAdminClient {
  private token: string | null = null
  private tokenExpiresAt = 0

  constructor(private readonly config: BuildingAiAdminConfig) {}

  private base(): string {
    return this.config.apiBaseUrl.replace(/\/$/, "")
  }

  private async login(): Promise<string> {
    if (this.token && this.tokenExpiresAt > Date.now() + 60_000) {
      return this.token
    }
    const response = await fetch(`${this.base()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: this.config.adminUsername,
        password: this.config.adminPassword,
        terminal: 1,
      }),
    })
    const body = (await response.json()) as ApiEnvelope<{ token?: string; expiresAt?: number }>
    if (!response.ok || body.code !== 20000 || !body.data?.token) {
      throw new Error(`BuildingAI admin login failed: ${body.message || response.status}`)
    }
    this.token = body.data.token
    this.tokenExpiresAt = body.data.expiresAt ? body.data.expiresAt : Date.now() + 3600_000
    return this.token
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await this.login()
    return fetch(`${this.base()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    })
  }

  async createUser(input: BuildingAiCreateUserInput): Promise<{ id: string }> {
    const response = await this.request("/consoleapi/users", {
      method: "POST",
      body: JSON.stringify({
        username: input.username,
        password: input.password,
        email: input.email,
        nickname: input.nickname || input.username,
      }),
    })
    const body = (await response.json()) as ApiEnvelope<{ id?: string }>
    if (!response.ok || body.code !== 20000) {
      throw new Error(`BuildingAI create user failed: ${body.message || response.status}`)
    }
    return { id: body.data?.id || "" }
  }

  async findUserByUsername(username: string): Promise<{ id: string; username: string } | null> {
    const qs = new URLSearchParams({ page: "1", pageSize: "50", keyword: username })
    const response = await this.request(`/consoleapi/users?${qs.toString()}`)
    const body = (await response.json()) as ApiEnvelope<{
      items?: Array<{ id: string; username: string }>
    }>
    if (!response.ok || body.code !== 20000) {
      throw new Error(`BuildingAI list users failed: ${body.message || response.status}`)
    }
    const items = body.data?.items || []
    return items.find((u) => u.username === username) || null
  }

  async resetPassword(userId: string, password: string): Promise<void> {
    const response = await this.request(`/consoleapi/users/reset-password/${userId}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    })
    const body = (await response.json()) as ApiEnvelope<unknown>
    if (!response.ok || body.code !== 20000) {
      throw new Error(`BuildingAI reset password failed: ${body.message || response.status}`)
    }
  }

  async resetPasswordByUsername(username: string, password: string): Promise<void> {
    const user = await this.findUserByUsername(username)
    if (!user) {
      throw new Error(`BuildingAI user not found: ${username}`)
    }
    await this.resetPassword(user.id, password)
  }

  /**
   * Ensure BuildingAI has username with password.
   * Creates if missing; otherwise resets password.
   */
  async syncUserCredentials(input: BuildingAiCreateUserInput): Promise<{ action: "created" | "password_reset" }> {
    const existing = await this.findUserByUsername(input.username)
    if (!existing) {
      await this.createUser(input)
      return { action: "created" }
    }
    await this.resetPassword(existing.id, input.password)
    return { action: "password_reset" }
  }
}
