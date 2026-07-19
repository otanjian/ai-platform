import type { KeycloakConfig } from "./types"

export type KeycloakTokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  token_type: string
}

export type KeycloakUser = {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  enabled: boolean
  realmRoles?: string[]
}

export class KeycloakAdminClient {
  private token: string | null = null
  private tokenExpiresAt = 0

  constructor(private readonly config: KeycloakConfig) {}

  private getAdminUrl(): string {
    return `${this.config.url}/admin/realms/${this.config.realm}`
  }

  private async getToken(): Promise<string> {
    if (this.token && this.tokenExpiresAt > Date.now() + 60_000) {
      return this.token
    }
    if (!this.config.adminUsername || !this.config.adminPassword) {
      throw new Error("Keycloak admin username and password are required")
    }
    const params = new URLSearchParams({
      grant_type: "password",
      client_id: "admin-cli",
      username: this.config.adminUsername,
      password: this.config.adminPassword,
    })
    const response = await fetch(`${this.config.url}/realms/master/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    })
    if (!response.ok) {
      throw new Error(`Keycloak admin login failed: ${response.status}`)
    }
    const data = (await response.json()) as KeycloakTokenResponse
    this.token = data.access_token
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000
    return this.token
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await this.getToken()
    const url = `${this.getAdminUrl()}${path}`
    return fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    })
  }

  async getUserById(userId: string): Promise<KeycloakUser | null> {
    const response = await this.request(`/users/${userId}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to get user: ${response.status}`)
    return response.json() as Promise<KeycloakUser>
  }

  async getUserRealmRoles(userId: string): Promise<string[]> {
    const response = await this.request(`/users/${userId}/role-mappings/realm`)
    if (!response.ok) throw new Error(`Failed to get user roles: ${response.status}`)
    const data = (await response.json()) as Array<{ name: string }>
    return data.map((r) => r.name)
  }

  async listUsers(): Promise<KeycloakUser[]> {
    const response = await this.request(`/users?max=1000`)
    if (!response.ok) throw new Error(`Failed to list users: ${response.status}`)
    return response.json() as Promise<KeycloakUser[]>
  }

  async getRole(roleName: string): Promise<{ id: string; name: string } | null> {
    const response = await this.request(`/roles/${roleName}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Failed to get role: ${response.status}`)
    return response.json() as Promise<{ id: string; name: string }>
  }

  async createUser(user: { username: string; email?: string; firstName?: string; lastName?: string; enabled?: boolean }): Promise<{ id: string }> {
    const response = await this.request(`/users`, {
      method: "POST",
      body: JSON.stringify({ enabled: true, ...user }),
    })
    if (!response.ok) throw new Error(`Failed to create user: ${response.status}`)
    const location = response.headers.get("location")
    const id = location ? location.split("/").pop() : ""
    return { id: id || "" }
  }

  async updateUser(userId: string, user: Partial<KeycloakUser>): Promise<void> {
    const response = await this.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(user),
    })
    if (!response.ok) throw new Error(`Failed to update user: ${response.status}`)
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await this.request(`/users/${userId}`, { method: "DELETE" })
    if (!response.ok) throw new Error(`Failed to delete user: ${response.status}`)
  }

  async setUserPassword(userId: string, password: string, temporary = false): Promise<void> {
    const response = await this.request(`/users/${userId}/reset-password`, {
      method: "PUT",
      body: JSON.stringify({ type: "password", value: password, temporary }),
    })
    if (!response.ok) throw new Error(`Failed to reset password: ${response.status}`)
  }

  async listRealmRoles(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await this.request(`/roles?max=1000`)
    if (!response.ok) throw new Error(`Failed to list roles: ${response.status}`)
    return response.json() as Promise<Array<{ id: string; name: string; description?: string }>>
  }

  async createRealmRole(role: { name: string; description?: string }): Promise<void> {
    const response = await this.request(`/roles`, {
      method: "POST",
      body: JSON.stringify(role),
    })
    if (!response.ok) throw new Error(`Failed to create role: ${response.status}`)
  }

  async deleteRealmRole(roleName: string): Promise<void> {
    const response = await this.request(`/roles/${roleName}`, { method: "DELETE" })
    if (!response.ok) throw new Error(`Failed to delete role: ${response.status}`)
  }

  async assignRealmRoles(userId: string, roleNames: string[]): Promise<void> {
    const allRoles = await this.listRealmRoles()
    const roles = allRoles.filter((r) => roleNames.includes(r.name))
    const response = await this.request(`/users/${userId}/role-mappings/realm`, {
      method: "POST",
      body: JSON.stringify(roles),
    })
    if (!response.ok) throw new Error(`Failed to assign roles: ${response.status}`)
  }

  async removeRealmRoles(userId: string, roleNames: string[]): Promise<void> {
    const allRoles = await this.listRealmRoles()
    const roles = allRoles.filter((r) => roleNames.includes(r.name))
    const response = await this.request(`/users/${userId}/role-mappings/realm`, {
      method: "DELETE",
      body: JSON.stringify(roles),
    })
    if (!response.ok) throw new Error(`Failed to remove roles: ${response.status}`)
  }

  async listGroups(): Promise<Array<{ id: string; name: string; path?: string }>> {
    const response = await this.request(`/groups?max=1000`)
    if (!response.ok) throw new Error(`Failed to list groups: ${response.status}`)
    return response.json() as Promise<Array<{ id: string; name: string; path?: string }>>
  }

  async createGroup(group: { name: string }): Promise<{ id: string }> {
    const response = await this.request(`/groups`, {
      method: "POST",
      body: JSON.stringify(group),
    })
    if (!response.ok) throw new Error(`Failed to create group: ${response.status}`)
    const location = response.headers.get("location")
    const id = location ? location.split("/").pop() : ""
    return { id: id || "" }
  }

  async deleteGroup(groupId: string): Promise<void> {
    const response = await this.request(`/groups/${groupId}`, { method: "DELETE" })
    if (!response.ok) throw new Error(`Failed to delete group: ${response.status}`)
  }

  async getUserGroups(userId: string): Promise<Array<{ id: string; name: string }>> {
    const response = await this.request(`/users/${userId}/groups`)
    if (!response.ok) throw new Error(`Failed to get user groups: ${response.status}`)
    return response.json() as Promise<Array<{ id: string; name: string }>>
  }

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    const response = await this.request(`/users/${userId}/groups/${groupId}`, { method: "PUT" })
    if (!response.ok) throw new Error(`Failed to add user to group: ${response.status}`)
  }

  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    const response = await this.request(`/users/${userId}/groups/${groupId}`, { method: "DELETE" })
    if (!response.ok) throw new Error(`Failed to remove user from group: ${response.status}`)
  }

  async listUserSessions(userId: string): Promise<Array<{ id: string; ipAddress?: string; start?: number; lastAccess?: number; clients?: Record<string, string> }>> {
    const response = await this.request(`/users/${userId}/sessions`)
    if (!response.ok) throw new Error(`Failed to list user sessions: ${response.status}`)
    return response.json() as Promise<Array<{ id: string; ipAddress?: string; start?: number; lastAccess?: number; clients?: Record<string, string> }>>
  }

  async logoutUser(userId: string): Promise<void> {
    const response = await this.request(`/users/${userId}/logout`, { method: "POST" })
    if (!response.ok) throw new Error(`Failed to logout user: ${response.status}`)
  }
}
