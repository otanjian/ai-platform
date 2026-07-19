import crypto from "crypto"
import type { OidcConfig } from "./types"

export type OidcDiscovery = {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  end_session_endpoint?: string
  issuer: string
}

export type OidcTokens = {
  access_token: string
  id_token?: string
  refresh_token?: string
  expires_at: number
}

export type OidcUserInfo = {
  sub: string
  preferred_username?: string
  email?: string
  name?: string
  groups?: string[]
  [key: string]: unknown
}

export type OidcState = {
  state: string
  codeVerifier: string
  redirectUri: string
}

export class OidcClient {
  private discovery: OidcDiscovery | null = null

  constructor(private readonly config: OidcConfig) {}

  async getDiscovery(): Promise<OidcDiscovery> {
    if (this.discovery) return this.discovery
    const issuer = this.config.issuer.replace(/\/$/, "")
    const url = `${issuer}/.well-known/openid-configuration`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`OIDC discovery failed: ${response.status} ${await response.text()}`)
    }
    this.discovery = (await response.json()) as OidcDiscovery
    return this.discovery
  }

  createAuthorizationUrl(): OidcState {
    const state = crypto.randomUUID()
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)

    const redirectUri = this.config.redirectUri
    const scope = this.config.scopes.join(" ")

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      scope,
      redirect_uri: redirectUri,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    return {
      state,
      codeVerifier,
      redirectUri,
    }
  }

  async buildAuthorizationRedirectUrl(state: OidcState): Promise<string> {
    const discovery = await this.getDiscovery()
    const codeChallenge = generateCodeChallenge(state.codeVerifier)
    const scope = this.config.scopes.join(" ")

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      scope,
      redirect_uri: state.redirectUri,
      state: state.state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    return `${discovery.authorization_endpoint}?${params.toString()}`
  }

  async exchangeCode(code: string, redirectUri: string, codeVerifier: string): Promise<OidcTokens> {
    const discovery = await this.getDiscovery()
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.config.clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })

    const response = await fetch(discovery.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!response.ok) {
      throw new Error(`OIDC token exchange failed: ${response.status} ${await response.text()}`)
    }

    const data = (await response.json()) as {
      access_token: string
      id_token?: string
      refresh_token?: string
      expires_in: number
    }

    return {
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    }
  }

  async getUserInfo(accessToken: string): Promise<OidcUserInfo> {
    const discovery = await this.getDiscovery()
    const response = await fetch(discovery.userinfo_endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) {
      throw new Error(`OIDC userinfo failed: ${response.status} ${await response.text()}`)
    }
    return (await response.json()) as OidcUserInfo
  }

  async refreshToken(refreshToken: string): Promise<OidcTokens> {
    const discovery = await this.getDiscovery()
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.config.clientId,
      refresh_token: refreshToken,
    })

    const response = await fetch(discovery.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!response.ok) {
      throw new Error(`OIDC refresh failed: ${response.status} ${await response.text()}`)
    }

    const data = (await response.json()) as {
      access_token: string
      id_token?: string
      refresh_token?: string
      expires_in: number
    }

    return {
      access_token: data.access_token,
      id_token: data.id_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    }
  }

  async buildLogoutUrl(postLogoutRedirectUri: string): Promise<string | null> {
    const discovery = await this.getDiscovery()
    if (!discovery.end_session_endpoint) return null
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      post_logout_redirect_uri: postLogoutRedirectUri,
    })
    return `${discovery.end_session_endpoint}?${params.toString()}`
  }
}

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url")
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url")
}

export function extractGroups(userInfo: OidcUserInfo): string[] {
  const groups = userInfo.groups
  if (!groups) return []
  if (Array.isArray(groups)) return groups
  if (typeof groups === "string") return [groups]
  return []
}

export function mapGroupsToProjects(groups: string[], groupMapping: Record<string, string>): string[] {
  const projects = new Set<string>()
  for (const group of groups) {
    const project = groupMapping[group]
    if (project) projects.add(project)
  }
  return Array.from(projects)
}
