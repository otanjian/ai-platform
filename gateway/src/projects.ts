import { access, constants, readdir, stat } from "fs/promises"
import path from "path"
import { and, eq, ne } from "drizzle-orm"
import { db } from "./db/db.js"
import * as schema from "./db/schema.js"

export type ProjectRole = "owner" | "admin" | "member" | "viewer"
export type ProjectStatus = "active" | "archived" | "deleted"

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  owner: "所有者",
  admin: "管理员",
  member: "成员",
  viewer: "观察者",
}

export function isAbsolutePath(projectPath: string): boolean {
  return path.isAbsolute(projectPath)
}

export async function validateProjectDirectory(projectPath: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!projectPath || typeof projectPath !== "string") {
    return { ok: false, error: "项目路径不能为空" }
  }
  if (!isAbsolutePath(projectPath)) {
    return { ok: false, error: "项目路径必须是绝对路径" }
  }
  try {
    const info = await stat(projectPath)
    if (!info.isDirectory()) {
      return { ok: false, error: "项目路径必须是目录" }
    }
    await access(projectPath, constants.R_OK)
    return { ok: true }
  } catch {
    return { ok: false, error: "项目目录不存在或不可访问" }
  }
}

export async function getWorkspaceRoot(): Promise<string> {
  const fromEnv = process.env.PROJECT_WORKSPACE_ROOT?.trim()
  if (fromEnv) return path.resolve(fromEnv)

  const rows = await db
    .select()
    .from(schema.systemSetting)
    .where(eq(schema.systemSetting.settingKey, "project.workspaceRoot"))
    .limit(1)
  if (rows[0]?.settingValue?.trim()) {
    return path.resolve(rows[0].settingValue.trim())
  }
  return path.resolve("/data/projects")
}

export type ProjectPathOption = {
  path: string
  name: string
  occupied: boolean
}

/** List selectable project directories under the workspace root (1 level). */
export async function listProjectPathOptions(): Promise<{
  workspaceRoot: string
  paths: ProjectPathOption[]
}> {
  const workspaceRoot = await getWorkspaceRoot()
  const registered = await db.select({ projectPath: schema.project.projectPath }).from(schema.project)
  const occupied = new Set(
    registered
      .map((r) => r.projectPath)
      .filter((p): p is string => !!p)
      .map((p) => path.resolve(p))
  )

  const paths: ProjectPathOption[] = []
  try {
    const rootStat = await stat(workspaceRoot)
    if (!rootStat.isDirectory()) {
      return { workspaceRoot, paths: [] }
    }

    // Include workspace root itself as an option
    paths.push({
      path: workspaceRoot,
      name: path.basename(workspaceRoot) || workspaceRoot,
      occupied: occupied.has(workspaceRoot),
    })

    const entries = await readdir(workspaceRoot, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith(".")) continue
      const full = path.join(workspaceRoot, entry.name)
      paths.push({
        path: full,
        name: entry.name,
        occupied: occupied.has(path.resolve(full)),
      })
    }
  } catch {
    return { workspaceRoot, paths: [] }
  }

  paths.sort((a, b) => a.path.localeCompare(b.path))
  return { workspaceRoot, paths }
}

export async function isSuperAdmin(userId: number): Promise<boolean> {
  const rows = await db
    .select({ roleName: schema.platformRole.name })
    .from(schema.platformUser)
    .innerJoin(schema.platformRole, eq(schema.platformUser.defaultRoleId, schema.platformRole.id))
    .where(eq(schema.platformUser.id, userId))
    .limit(1)
  return rows[0]?.roleName === "super_admin"
}

export async function getMembership(projectId: number, userId: number) {
  const rows = await db
    .select()
    .from(schema.projectMember)
    .where(and(eq(schema.projectMember.projectId, projectId), eq(schema.projectMember.platformUserId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export function canManageMembers(role: ProjectRole | null, superAdmin: boolean): boolean {
  if (superAdmin) return true
  return role === "owner" || role === "admin"
}

export function canEditProject(role: ProjectRole | null, superAdmin: boolean): boolean {
  if (superAdmin) return true
  return role === "owner" || role === "admin"
}

export function canViewProject(role: ProjectRole | null, superAdmin: boolean): boolean {
  if (superAdmin) return true
  return role !== null
}

export async function assertCanAccessProject(projectId: number, userId: number) {
  const superAdmin = await isSuperAdmin(userId)
  const membership = await getMembership(projectId, userId)
  if (!canViewProject((membership?.role as ProjectRole) ?? null, superAdmin)) {
    return { ok: false as const, status: 403 as const, error: "无权访问该项目" }
  }
  const projects = await db.select().from(schema.project).where(and(eq(schema.project.id, projectId), ne(schema.project.status, "deleted"))).limit(1)
  if (projects.length === 0) {
    return { ok: false as const, status: 404 as const, error: "项目不存在" }
  }
  return { ok: true as const, project: projects[0], membership, superAdmin }
}
