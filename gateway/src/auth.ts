import { type Context } from "hono"
import { getCookie, setCookie, deleteCookie } from "hono/cookie"
import type { UserStore } from "./user-store"
import type { GatewayConfig, LocalSessionData, OidcSessionData, Session, User } from "./types"

export class AuthManager {
  constructor(private readonly config: GatewayConfig) {}

  isAdmin(username: string): boolean {
    return this.config.adminUsers.includes(username)
  }

  async verifyLocalPassword(username: string, password: string, userStore: UserStore): Promise<User | null> {
    const user = userStore.getUser(username)
    if (!user) return null
    const ok = await Bun.password.verify(password, user.passwordHash)
    return ok ? user : null
  }

  getLocalUser(username: string, userStore: UserStore): User | undefined {
    return userStore.getUser(username)
  }

  createLocalSession(c: Context, username: string): void {
    this.writeSessionCookie(c, this.createSessionToken({ username }))
  }

  createOidcSession(c: Context, data: OidcSessionData): void {
    this.writeSessionCookie(c, this.createSessionToken({ username: data.username, oidc: data }))
  }

  clearSession(c: Context): void {
    deleteCookie(c, this.config.cookieName)
  }

  getSession(c: Context): Session | null {
    const token = getCookie(c, this.config.cookieName) ?? null
    return this.parseSessionToken(token)
  }

  getSessionFromRequest(req: Request): Session | null {
    const cookie = req.headers.get("cookie")
    if (!cookie) return null
    const match = cookie.match(new RegExp(`${this.config.cookieName}=([^;]+)`))
    return this.parseSessionToken(match ? decodeURIComponent(match[1]) : null)
  }

  createSessionToken(session: Omit<Session, "createdAt">): string {
    const payload = JSON.stringify({ ...session, createdAt: Date.now() })
    const signature = this.sign(payload)
    const encodedPayload = Buffer.from(payload).toString("base64url")
    return `${encodedPayload}.${signature}`
  }

  parseSessionToken(token: string | null): Session | null {
    if (!token) return null
    const [encodedPayload, signature] = token.split(".")
    if (!encodedPayload || !signature) return null
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8")
    if (signature !== this.sign(payload)) return null
    try {
      const session = JSON.parse(payload) as Session
      if (!session.username || typeof session.username !== "string") return null
      return session
    } catch {
      return null
    }
  }

  private writeSessionCookie(c: Context, token: string): void {
    setCookie(c, this.config.cookieName, token, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  private sign(payload: string): string {
    const encoder = new TextEncoder()
    const key = encoder.encode(this.config.sessionSecret)
    const data = encoder.encode(payload)
    const hash = new Bun.CryptoHasher("sha256", key)
    hash.update(data)
    return hash.digest("hex")
  }
}
