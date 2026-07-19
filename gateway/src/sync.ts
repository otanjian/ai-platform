import { eq, and } from "drizzle-orm"
import { db } from "./db/db.js"
import * as schema from "./db/schema.js"
import type { KeycloakAdminClient, KeycloakUser } from "./keycloak.js"

export async function syncUserFromKeycloak(
  keycloakUserId: string,
  username: string,
  email: string | null | undefined,
  adminClient: KeycloakAdminClient
): Promise<{ id: number; defaultRoleId: number | null }> {
  const existing = await db
    .select()
    .from(schema.platformUser)
    .where(eq(schema.platformUser.keycloakUserId, keycloakUserId))

  const realmRoles = await adminClient.getUserRealmRoles(keycloakUserId)
  const defaultRole = await resolveDefaultRole(realmRoles)

  if (existing.length > 0) {
    const user = existing[0]
    await db
      .update(schema.platformUser)
      .set({ username, email: email || null, defaultRoleId: defaultRole?.id ?? null })
      .where(eq(schema.platformUser.id, user.id))
    return { id: user.id, defaultRoleId: defaultRole?.id ?? null }
  }

  const inserted = await db.insert(schema.platformUser).values({
    keycloakUserId,
    username,
    email: email || null,
    defaultRoleId: defaultRole?.id ?? null,
  })
  const id = Number(inserted[0].insertId)
  return { id, defaultRoleId: defaultRole?.id ?? null }
}

async function resolveDefaultRole(realmRoles: string[]): Promise<{ id: number; name: string } | null> {
  const rolePriority = [
    "aiplatform-super-admin",
    "aiplatform-developer",
    "aiplatform-data-analyst",
    "aiplatform-business-user",
  ]
  const matchedRole = rolePriority.find((r) => realmRoles.includes(r))
  if (!matchedRole) return null
  const rows = await db
    .select()
    .from(schema.platformRole)
    .where(eq(schema.platformRole.keycloakRoleName, matchedRole))
  return rows[0] ?? null
}

export async function getUserPermissions(userId: number): Promise<Map<string, string>> {
  const rows = await db
    .select({
      menuCode: schema.roleMenuPermission.menuCode,
      permission: schema.roleMenuPermission.permission,
    })
    .from(schema.roleMenuPermission)
    .innerJoin(schema.platformUser, eq(schema.platformUser.defaultRoleId, schema.roleMenuPermission.roleId))
    .where(eq(schema.platformUser.id, userId))
  const result = new Map<string, string>()
  for (const row of rows) {
    result.set(row.menuCode ?? "", row.permission ?? "none")
  }
  return result
}

export async function getFieldPermissions(userId: number, resource: string): Promise<Map<string, string>> {
  const rows = await db
    .select({
      field: schema.roleFieldPermission.field,
      permission: schema.roleFieldPermission.permission,
    })
    .from(schema.roleFieldPermission)
    .innerJoin(schema.platformUser, eq(schema.platformUser.defaultRoleId, schema.roleFieldPermission.roleId))
    .where(and(eq(schema.platformUser.id, userId), eq(schema.roleFieldPermission.resource, resource)))
  const result = new Map<string, string>()
  for (const row of rows) {
    result.set(row.field, row.permission ?? "none")
  }
  return result
}

export function filterFields<T extends Record<string, unknown>>(data: T, permissions: Map<string, string>): Partial<T> {
  const result = {} as Partial<T>
  for (const key of Object.keys(data)) {
    const perm = permissions.get(key) ?? "none"
    if (perm !== "none") {
      result[key as keyof T] = data[key] as T[keyof T]
    }
  }
  return result
}

export async function getPlatformUserByKeycloakId(
  keycloakUserId: string
): Promise<{ id: number; defaultRoleId: number | null } | null> {
  const rows = await db
    .select()
    .from(schema.platformUser)
    .where(eq(schema.platformUser.keycloakUserId, keycloakUserId))
  return rows[0] ?? null
}

/** Sync Keycloak realm users into platform_user and return platform rows. */
export async function listSyncedPlatformUsers(
  adminClient: KeycloakAdminClient
): Promise<Array<{ id: number; username: string; email: string | null; keycloakUserId: string }>> {
  const kcUsers = await adminClient.listUsers()
  const result: Array<{ id: number; username: string; email: string | null; keycloakUserId: string }> = []

  for (const kcUser of kcUsers) {
    if (!kcUser.id || !kcUser.username) continue
    if (kcUser.enabled === false) continue
    try {
      const synced = await syncUserFromKeycloak(kcUser.id, kcUser.username, kcUser.email, adminClient)
      result.push({
        id: synced.id,
        username: kcUser.username,
        email: kcUser.email ?? null,
        keycloakUserId: kcUser.id,
      })
    } catch (err) {
      console.warn(`Failed to sync Keycloak user ${kcUser.username}:`, err)
    }
  }

  result.sort((a, b) => a.username.localeCompare(b.username))
  return result
}
