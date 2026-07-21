import { Hono } from "hono"
import { db } from "../db/db.js"
import * as schema from "../db/schema.js"
import { eq, desc, and, count, sql, ne, inArray, asc } from "drizzle-orm"
import { getUserPermissions, getFieldPermissions, filterFields, listSyncedPlatformUsers } from "../sync.js"
import {
  assertCanAccessProject,
  canEditProject,
  canManageMembers,
  isSuperAdmin,
  listProjectPathOptions,
  validateProjectDirectory,
  type ProjectRole,
} from "../projects.js"
import {
  buildOpenCodeSessionEmbedUrl,
  createOpenCodeSession,
  getSessionDiff,
  getVcsDiff,
  listOpenCodeSessions,
  runSessionCommand,
} from "../opencode-client.js"
import { parseReviewResult } from "../code-review.js"
import { buildGithubWorkflowYaml, parseGithubWorkflowTriggers } from "../github-workflow.js"
import { KeycloakAdminClient } from "../keycloak.js"
import type { GatewayConfig } from "../types.js"
import { AI_BRAIN_SETTINGS_MENU_ITEMS } from "../ai-brain-settings-menus.ts"
import { AI_BRAIN_KNOWLEDGE_MENU_ITEMS } from "../ai-brain-knowledge-menus.ts"
import { AI_BRAIN_WORKSPACE_MENU_ITEMS } from "../ai-brain-workspace-menus.ts"
import { TASK_HUB_MENU_ITEMS } from "../task-hub-menus.ts"
import { DATA_INSIGHTS_SUPERSET_MENU_ITEMS } from "../data-insights-superset-menus.ts"
import { buildMenuTreeFromFlat } from "../menu-tree.ts"

export function platformRouter(config: GatewayConfig) {
  const app = new Hono()
  const keycloakAdmin = new KeycloakAdminClient(config.keycloak)

  // Session field permissions for current user
  app.get("/session/fields", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    const resource = c.req.query("resource")
    if (!userId || !resource) return c.json({})
    const permissions = await getFieldPermissions(userId, resource)
    const obj: Record<string, string> = {}
    permissions.forEach((value, key) => {
      obj[key] = value
    })
    return c.json(obj)
  })

  const allMenuItems = [
    { code: "dashboard", label: "总览", icon: "LayoutDashboard", path: "/dashboard", parent: null, sort: 1 },
    ...TASK_HUB_MENU_ITEMS,
    { code: "code_factory", label: "代码工场", icon: "Code2", path: "/code-factory", parent: null, sort: 3 },
    { code: "code_factory.chat", label: "AI 编程会话", icon: "MessageSquare", path: "/code-factory/chat", parent: "code_factory", sort: 1 },
    { code: "code_factory.sessions", label: "会话列表", icon: "List", path: "/code-factory/sessions", parent: "code_factory", sort: 2 },
    { code: "code_factory.review", label: "代码审查", icon: "GitPullRequest", path: "/code-factory/review", parent: "code_factory", sort: 3 },
    { code: "code_factory.diff", label: "变更 Diff", icon: "FileDiff", path: "/code-factory/diff", parent: "code_factory", sort: 4 },
    { code: "code_factory.project_init", label: "项目初始化", icon: "Rocket", path: "/code-factory/project-init", parent: "code_factory", sort: 5 },
    { code: "code_factory.github", label: "GitHub 自动化", icon: "Github", path: "/code-factory/github", parent: "code_factory", sort: 6 },
    { code: "code_factory.config", label: "配置管理", icon: "Settings", path: "/code-factory/config", parent: "code_factory", sort: 7 },
    ...DATA_INSIGHTS_SUPERSET_MENU_ITEMS,
    { code: "ai_brain", label: "AI大脑", icon: "Brain", path: "/ai-brain", parent: null, sort: 5 },
    ...AI_BRAIN_WORKSPACE_MENU_ITEMS,
    { code: "ai_brain.agents", label: "智能体", icon: "Bot", path: "/ai-brain/agents", parent: "ai_brain", sort: 3 },
    { code: "ai_brain.knowledge", label: "知识库", icon: "Library", path: "/ai-brain/knowledge", parent: "ai_brain", sort: 4 },
    ...AI_BRAIN_KNOWLEDGE_MENU_ITEMS,
    { code: "ai_brain.settings", label: "智能体设置", icon: "Settings", path: "/ai-brain/settings", parent: "ai_brain", sort: 6 },
    ...AI_BRAIN_SETTINGS_MENU_ITEMS,
    { code: "smart_pipeline", label: "智能流水线", icon: "Workflow", path: "/smart-pipeline", parent: null, sort: 6 },
    { code: "smart_pipeline.canvas", label: "流水线画布", icon: "Paintbrush", path: "/smart-pipeline/canvas", parent: "smart_pipeline", sort: 1 },
    { code: "smart_pipeline.templates", label: "模板市场", icon: "Store", path: "/smart-pipeline/templates", parent: "smart_pipeline", sort: 2 },
    { code: "smart_pipeline.history", label: "执行历史", icon: "History", path: "/smart-pipeline/history", parent: "smart_pipeline", sort: 3 },
    { code: "smart_pipeline.triggers", label: "触发器配置", icon: "Clock", path: "/smart-pipeline/triggers", parent: "smart_pipeline", sort: 4 },
    { code: "system_settings", label: "系统管理", icon: "Settings", path: "/system-settings", parent: null, sort: 7 },
    { code: "system_settings.users", label: "用户管理", icon: "Users", path: "/system-settings/users", parent: "system_settings", sort: 1 },
    { code: "system_settings.roles", label: "角色管理", icon: "Shield", path: "/system-settings/roles", parent: "system_settings", sort: 2 },
    { code: "system_settings.groups", label: "组管理", icon: "Group", path: "/system-settings/groups", parent: "system_settings", sort: 3 },
    { code: "system_settings.sessions", label: "会话管理", icon: "Monitor", path: "/system-settings/sessions", parent: "system_settings", sort: 4 },
    { code: "system_settings.role_mapping", label: "平台角色权限", icon: "KeyRound", path: "/system-settings/role-mapping", parent: "system_settings", sort: 5 },
    { code: "system_settings.field_permissions", label: "字段权限", icon: "TableProperties", path: "/system-settings/field-permissions", parent: "system_settings", sort: 6 },
    { code: "system_settings.subsystems", label: "子系统连接", icon: "Link", path: "/system-settings/subsystems", parent: "system_settings", sort: 7 },
    { code: "system_settings.api_keys", label: "API 密钥", icon: "Key", path: "/system-settings/api-keys", parent: "system_settings", sort: 7 },
    { code: "system_settings.notifications", label: "通知设置", icon: "Bell", path: "/system-settings/notifications", parent: "system_settings", sort: 8 },
    { code: "system_settings.audit_logs", label: "操作日志", icon: "ScrollText", path: "/system-settings/audit-logs", parent: "system_settings", sort: 9 },
    { code: "system_settings.settings", label: "系统设置", icon: "Settings2", path: "/system-settings/settings", parent: "system_settings", sort: 10 },
  ]

  const buildMenuTree = (allowed?: (code: string) => boolean) =>
    buildMenuTreeFromFlat(allMenuItems, allowed)

  // Full menu tree for role permission assignment (no auth filtering)
  app.get("/admin/menu-tree", async (c) => {
    return c.json(buildMenuTree())
  })

  // Session menu permissions (tree structure aligned with 方案思路 menu panorama)
  app.get("/session/menu", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json([])
    const permissions = await getUserPermissions(userId)
    const allowed = (code: string): boolean => {
      const perm = permissions.get(code)
      return !!perm && perm !== "none"
    }
    return c.json(buildMenuTree(allowed))
  })

  // Health & stats
  app.get("/gateway/health", async (c) => {
    const [opencodeHealth, taskviewHealth, supersetHealth, buildingaiHealth] = await Promise.all([
      probeHttp(config.subsystems.opencode.baseUrl),
      probeHttp(config.subsystems.taskview.webBaseUrl),
      probeHttp(config.subsystems.superset.baseUrl),
      probeHttp(config.subsystems.buildingai.baseUrl),
    ])
    return c.json({
      status: "ok",
      database: await checkDatabase(),
      redis: "connected",
      keycloak: config.keycloak.url,
      opencode: opencodeHealth ? "online" : "offline",
      taskview: taskviewHealth ? "online" : "offline",
      superset: supersetHealth ? "online" : "offline",
      buildingai: buildingaiHealth ? "online" : "offline",
    })
  })

  app.get("/gateway/stats", async (c) => {
    // Placeholder: aggregate stats from subsystems
    const users = await db.select({ value: count() }).from(schema.platformUser)
    const pipelines = await db.select({ value: count() }).from(schema.pipelineDefinition)
    const executions = await db.select({ value: count() }).from(schema.pipelineExecution)
    const audits = await db.select({ value: count() }).from(schema.auditLog)
    return c.json({
      users: users[0]?.value ?? 0,
      pipelines: pipelines[0]?.value ?? 0,
      executions: executions[0]?.value ?? 0,
      audits: audits[0]?.value ?? 0,
    })
  })

  // Subsystem configs
  app.get("/admin/subsystems", async (c) => {
    const rows = await db.select().from(schema.subsystemConfig)
    return c.json(rows)
  })

  app.put("/admin/subsystems/:system", async (c) => {
    const system = c.req.param("system")
    const body = await c.req.json()
    await db
      .update(schema.subsystemConfig)
      .set({
        baseUrl: body.baseUrl,
        authType: body.authType,
        clientId: body.clientId,
        clientSecret: body.clientSecret,
        adminUsername: body.adminUsername,
        adminPassword: body.adminPassword,
        platformOid: body.platformOid,
        platformRid: body.platformRid,
        extraConfig: body.extraConfig,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(schema.subsystemConfig.system, system as any))
    return c.json({ success: true })
  })

  // Audit logs
  app.get("/admin/audit-logs", async (c) => {
    const subsystem = c.req.query("subsystem")
    const userId = c.req.query("userId")
    const limit = Math.min(Number(c.req.query("limit") || "50"), 200)
    const offset = Number(c.req.query("offset") || "0")
    let query = db.select().from(schema.auditLog).limit(limit).offset(offset).orderBy(desc(schema.auditLog.createdAt))
    const conditions = []
    if (subsystem) {
      conditions.push(eq(schema.auditLog.subsystem, subsystem as any))
    }
    if (userId) {
      conditions.push(eq(schema.auditLog.platformUserId, Number(userId)))
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }
    const rows = await query
    return c.json(rows)
  })

  // Pipeline definitions
  app.get("/pipeline/definitions", async (c) => {
    const rows = await db.select().from(schema.pipelineDefinition).orderBy(desc(schema.pipelineDefinition.updatedAt))
    return c.json(rows)
  })

  app.post("/pipeline/definitions", async (c) => {
    const body = await c.req.json()
    const userId = c.get("platformUserId") as number
    const inserted = await db.insert(schema.pipelineDefinition).values({
      name: body.name,
      description: body.description,
      dagJson: body.dagJson,
      triggerType: body.triggerType || "manual",
      cronExpression: body.cronExpression,
      webhookSecret: body.webhookSecret,
      isActive: body.isActive ?? true,
      createdBy: userId,
    })
    return c.json({ id: Number(inserted[0].insertId) })
  })

  app.get("/pipeline/executions", async (c) => {
    const rows = await db
      .select()
      .from(schema.pipelineExecution)
      .orderBy(desc(schema.pipelineExecution.createdAt))
      .limit(100)
    return c.json(rows)
  })

  // Users
  app.get("/admin/users", async (c) => {
    const rows = await db.select().from(schema.platformUser)
    return c.json(rows)
  })

  // Roles & permissions
  app.get("/admin/roles", async (c) => {
    const rows = await db.select().from(schema.platformRole)
    return c.json(rows)
  })

  app.post("/admin/roles", async (c) => {
    const body = await c.req.json() as { name: string; keycloakRoleName: string; displayName?: string; description?: string }
    const inserted = await db.insert(schema.platformRole).values({
      name: body.name,
      keycloakRoleName: body.keycloakRoleName,
      displayName: body.displayName,
      description: body.description,
    })
    return c.json({ id: Number(inserted[0].insertId) }, 201)
  })

  app.put("/admin/roles/:roleId", async (c) => {
    const roleId = Number(c.req.param("roleId"))
    const body = await c.req.json() as Partial<{ name: string; keycloakRoleName: string; displayName: string; description: string }>
    await db.update(schema.platformRole).set(body).where(eq(schema.platformRole.id, roleId))
    return c.json({ success: true })
  })

  app.delete("/admin/roles/:roleId", async (c) => {
    const roleId = Number(c.req.param("roleId"))
    await db.delete(schema.platformRole).where(eq(schema.platformRole.id, roleId))
    return c.json({ success: true })
  })

  app.get("/admin/roles/:roleId/permissions", async (c) => {
    const roleId = Number(c.req.param("roleId"))
    const rows = await db
      .select()
      .from(schema.roleMenuPermission)
      .where(eq(schema.roleMenuPermission.roleId, roleId))
    return c.json(rows)
  })

  app.put("/admin/roles/:roleId/permissions", async (c) => {
    const roleId = Number(c.req.param("roleId"))
    const body = (await c.req.json()) as Array<{ menuCode: string; permission: string }>
    for (const item of body) {
      await db
        .insert(schema.roleMenuPermission)
        .values({
          roleId,
          menuCode: item.menuCode,
          permission: item.permission as any,
        })
        .onDuplicateKeyUpdate({
          set: { permission: item.permission as any },
        })
    }
    return c.json({ success: true })
  })

  // Field-level permissions per role
  app.get("/admin/roles/:roleId/field-permissions", async (c) => {
    const roleId = Number(c.req.param("roleId"))
    const rows = await db
      .select()
      .from(schema.roleFieldPermission)
      .where(eq(schema.roleFieldPermission.roleId, roleId))
    return c.json(rows)
  })

  app.put("/admin/roles/:roleId/field-permissions", async (c) => {
    const roleId = Number(c.req.param("roleId"))
    const body = (await c.req.json()) as Array<{ resource: string; field: string; permission: string }>
    for (const item of body) {
      await db
        .insert(schema.roleFieldPermission)
        .values({
          roleId,
          resource: item.resource,
          field: item.field,
          permission: item.permission as any,
        })
        .onDuplicateKeyUpdate({
          set: { permission: item.permission as any },
        })
    }
    return c.json({ success: true })
  })

  app.delete("/admin/field-permissions/:id", async (c) => {
    const id = Number(c.req.param("id"))
    await db.delete(schema.roleFieldPermission).where(eq(schema.roleFieldPermission.id, id))
    return c.json({ success: true })
  })

  // Project templates
  app.get("/project-templates", async (c) => {
    const rows = await db
      .select()
      .from(schema.projectTemplate)
      .where(eq(schema.projectTemplate.isActive, true))
      .orderBy(schema.projectTemplate.id)
    return c.json(rows)
  })

  // Selectable project directories under workspace root
  app.get("/project-paths", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const result = await listProjectPathOptions()
    return c.json(result)
  })

  // Candidate users for project membership (sync from Keycloak on demand)
  app.get("/project-candidate-users", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    try {
      const users = await listSyncedPlatformUsers(keycloakAdmin)
      return c.json(users)
    } catch (err) {
      console.error("Failed to list candidate users:", err)
      // Fallback to local platform users if Keycloak admin is unavailable
      const rows = await db
        .select({
          id: schema.platformUser.id,
          username: schema.platformUser.username,
          email: schema.platformUser.email,
          keycloakUserId: schema.platformUser.keycloakUserId,
        })
        .from(schema.platformUser)
      return c.json(rows)
    }
  })

  // Projects
  app.get("/projects", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const status = (c.req.query("status") || "active") as "active" | "archived" | "all"
    const superAdmin = await isSuperAdmin(userId)

    let projects
    if (superAdmin) {
      projects = await db.select().from(schema.project).orderBy(desc(schema.project.updatedAt))
    } else {
      const memberships = await db
        .select({ projectId: schema.projectMember.projectId })
        .from(schema.projectMember)
        .where(eq(schema.projectMember.platformUserId, userId))
      const ids = memberships.map((m) => m.projectId)
      if (ids.length === 0) return c.json([])
      projects = await db
        .select()
        .from(schema.project)
        .where(inArray(schema.project.id, ids))
        .orderBy(desc(schema.project.updatedAt))
    }

    const filtered = projects.filter((p) => {
      if (p.status === "deleted") return false
      if (status === "all") return true
      return p.status === status
    })

    const result = await Promise.all(
      filtered.map(async (p) => {
        const members = await db
          .select({ value: count() })
          .from(schema.projectMember)
          .where(eq(schema.projectMember.projectId, p.id))
        const membership = await db
          .select({ role: schema.projectMember.role })
          .from(schema.projectMember)
          .where(
            and(eq(schema.projectMember.projectId, p.id), eq(schema.projectMember.platformUserId, userId))
          )
          .limit(1)
        return {
          ...p,
          memberCount: members[0]?.value ?? 0,
          myRole: membership[0]?.role ?? (superAdmin ? "admin" : null),
        }
      })
    )
    return c.json(result)
  })

  app.post("/projects", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const body = (await c.req.json()) as {
      name?: string
      description?: string
      projectPath?: string
      templateId?: number | null
      members?: Array<{ platformUserId: number; role: ProjectRole }>
    }
    if (!body.name?.trim()) return c.json({ error: "项目名称不能为空" }, 400)
    if (!body.projectPath?.trim()) return c.json({ error: "项目路径不能为空" }, 400)

    const pathCheck = await validateProjectDirectory(body.projectPath.trim())
    if (!pathCheck.ok) return c.json({ error: pathCheck.error }, 400)

    const existing = await db
      .select()
      .from(schema.project)
      .where(eq(schema.project.projectPath, body.projectPath.trim()))
      .limit(1)
    if (existing.length > 0) return c.json({ error: "该项目路径已被占用" }, 409)

    const inserted = await db.insert(schema.project).values({
      name: body.name.trim(),
      description: body.description ?? null,
      projectPath: body.projectPath.trim(),
      ownerId: userId,
      templateId: body.templateId ?? null,
      status: "active",
    })
    const projectId = Number(inserted[0].insertId)

    await db.insert(schema.projectMember).values({
      projectId,
      platformUserId: userId,
      role: "owner",
    })

    const extraMembers = (body.members || []).filter((m) => m.platformUserId !== userId)
    for (const m of extraMembers) {
      const role = m.role === "owner" ? "admin" : m.role
      await db.insert(schema.projectMember).values({
        projectId,
        platformUserId: m.platformUserId,
        role,
      })
    }

    const rows = await db.select().from(schema.project).where(eq(schema.project.id, projectId)).limit(1)
    return c.json(rows[0], 201)
  })

  app.get("/projects/:id", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const members = await db
      .select({
        id: schema.projectMember.id,
        platformUserId: schema.projectMember.platformUserId,
        role: schema.projectMember.role,
        username: schema.platformUser.username,
        email: schema.platformUser.email,
        createdAt: schema.projectMember.createdAt,
      })
      .from(schema.projectMember)
      .innerJoin(schema.platformUser, eq(schema.projectMember.platformUserId, schema.platformUser.id))
      .where(eq(schema.projectMember.projectId, projectId))

    return c.json({ ...access.project, members, myRole: access.membership?.role ?? (access.superAdmin ? "admin" : null) })
  })

  app.put("/projects/:id", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)
    if (!canEditProject((access.membership?.role as ProjectRole) ?? null, access.superAdmin)) {
      return c.json({ error: "无权修改项目" }, 403)
    }

    const body = (await c.req.json()) as {
      name?: string
      description?: string
      projectPath?: string
      templateId?: number | null
      status?: "active" | "archived" | "deleted"
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updates.name = body.name.trim()
    if (body.description !== undefined) updates.description = body.description
    if (body.templateId !== undefined) updates.templateId = body.templateId
    if (body.status !== undefined) updates.status = body.status

    if (body.projectPath !== undefined && body.projectPath !== access.project.projectPath) {
      const pathCheck = await validateProjectDirectory(body.projectPath.trim())
      if (!pathCheck.ok) return c.json({ error: pathCheck.error }, 400)
      const conflict = await db
        .select()
        .from(schema.project)
        .where(and(eq(schema.project.projectPath, body.projectPath.trim()), ne(schema.project.id, projectId)))
        .limit(1)
      if (conflict.length > 0) return c.json({ error: "该项目路径已被占用" }, 409)
      updates.projectPath = body.projectPath.trim()
    }

    await db.update(schema.project).set(updates).where(eq(schema.project.id, projectId))
    const rows = await db.select().from(schema.project).where(eq(schema.project.id, projectId)).limit(1)
    return c.json(rows[0])
  })

  app.delete("/projects/:id", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)
    if (!canEditProject((access.membership?.role as ProjectRole) ?? null, access.superAdmin)) {
      return c.json({ error: "无权删除项目" }, 403)
    }
    const mode = c.req.query("mode") || "archive"
    const status = mode === "delete" ? "deleted" : "archived"
    await db
      .update(schema.project)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.project.id, projectId))
    return c.json({ success: true, status })
  })

  // Cross-project session history for the current user
  app.get("/sessions", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)

    const publicBaseUrl = config.subsystems.opencode.baseUrl.replace(/\/$/, "")
    const rows = await db
      .select({
        id: schema.opencodeSession.id,
        sessionId: schema.opencodeSession.sessionId,
        projectId: schema.opencodeSession.projectId,
        projectName: schema.project.name,
        title: schema.opencodeSession.title,
        directory: schema.opencodeSession.directory,
        status: schema.opencodeSession.status,
        createdAt: schema.opencodeSession.createdAt,
        updatedAt: schema.opencodeSession.updatedAt,
      })
      .from(schema.opencodeSession)
      .innerJoin(schema.project, eq(schema.opencodeSession.projectId, schema.project.id))
      .where(
        and(
          eq(schema.opencodeSession.platformUserId, userId),
          eq(schema.opencodeSession.status, "active")
        )
      )
      .orderBy(desc(schema.opencodeSession.updatedAt))

    return c.json(
      rows.map((row) => ({
        id: row.id,
        sessionId: row.sessionId,
        projectId: row.projectId,
        projectName: row.projectName,
        title: row.title,
        directory: row.directory,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        embedUrl: buildOpenCodeSessionEmbedUrl(publicBaseUrl, row.sessionId),
      }))
    )
  })

  // Open or create the first OpenCode session for a project, persist mapping
  app.post("/projects/:id/open-chat", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const project = access.project
    const directory = project.projectPath
    if (!directory) return c.json({ error: "项目路径为空" }, 400)

    const opencode = config.subsystems.opencode
    const publicBaseUrl = opencode.baseUrl.replace(/\/$/, "")

    // 1) Prefer first mapped session for this user + project
    const mapped = await db
      .select()
      .from(schema.opencodeSession)
      .where(
        and(
          eq(schema.opencodeSession.projectId, projectId),
          eq(schema.opencodeSession.platformUserId, userId),
          eq(schema.opencodeSession.status, "active")
        )
      )
      .orderBy(asc(schema.opencodeSession.createdAt))
      .limit(1)

    if (mapped.length > 0) {
      const row = mapped[0]
      await db
        .update(schema.opencodeSession)
        .set({ updatedAt: new Date() })
        .where(eq(schema.opencodeSession.id, row.id))
      return c.json({
        sessionId: row.sessionId,
        projectId,
        title: row.title,
        created: false,
        embedUrl: buildOpenCodeSessionEmbedUrl(publicBaseUrl, row.sessionId),
      })
    }

    // 2) Look up existing OpenCode sessions in project directory
    let sessionId: string
    let title: string | null = null
    let created = false
    try {
      const existing = await listOpenCodeSessions(opencode.baseUrl, opencode.password, directory)
      if (existing.length > 0) {
        sessionId = existing[0].id
        title = existing[0].title || null
      } else {
        const createdSession = await createOpenCodeSession(
          opencode.baseUrl,
          opencode.password,
          directory,
          `${project.name} · ${new Date().toLocaleString("zh-CN")}`
        )
        sessionId = createdSession.id
        title = createdSession.title || null
        created = true
      }
    } catch (err) {
      console.error("OpenCode session open failed:", err)
      return c.json({ error: `打开 OpenCode 会话失败: ${(err as Error).message}` }, 502)
    }

    // 3) Persist mapping for later filtering
    await db.insert(schema.opencodeSession).values({
      sessionId,
      projectId,
      platformUserId: userId,
      title,
      directory,
      status: "active",
    })

    return c.json({
      sessionId,
      projectId,
      title,
      created,
      embedUrl: buildOpenCodeSessionEmbedUrl(publicBaseUrl, sessionId),
    })
  })

  app.get("/projects/:id/sessions", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const publicBaseUrl = config.subsystems.opencode.baseUrl.replace(/\/$/, "")
    const rows = await db
      .select()
      .from(schema.opencodeSession)
      .where(
        and(
          eq(schema.opencodeSession.projectId, projectId),
          eq(schema.opencodeSession.platformUserId, userId),
          eq(schema.opencodeSession.status, "active")
        )
      )
      .orderBy(desc(schema.opencodeSession.updatedAt))

    return c.json(
      rows.map((row) => ({
        id: row.id,
        sessionId: row.sessionId,
        projectId: row.projectId,
        title: row.title,
        directory: row.directory,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        embedUrl: buildOpenCodeSessionEmbedUrl(publicBaseUrl, row.sessionId),
      }))
    )
  })

  // Force-create a new OpenCode session for this user + project
  app.post("/projects/:id/sessions", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const project = access.project
    const directory = project.projectPath
    if (!directory) return c.json({ error: "项目路径为空" }, 400)

    const body = await c.req.json().catch(() => ({} as { title?: string }))
    const opencode = config.subsystems.opencode
    const publicBaseUrl = opencode.baseUrl.replace(/\/$/, "")
    const title = body.title?.trim() || `${project.name} · ${new Date().toLocaleString("zh-CN")}`

    let createdSession
    try {
      createdSession = await createOpenCodeSession(opencode.baseUrl, opencode.password, directory, title)
    } catch (err) {
      console.error("OpenCode session create failed:", err)
      return c.json({ error: `创建 OpenCode 会话失败: ${(err as Error).message}` }, 502)
    }

    await db.insert(schema.opencodeSession).values({
      sessionId: createdSession.id,
      projectId,
      platformUserId: userId,
      title: createdSession.title || title,
      directory,
      status: "active",
    })

    return c.json({
      sessionId: createdSession.id,
      projectId,
      title: createdSession.title || title,
      created: true,
      embedUrl: buildOpenCodeSessionEmbedUrl(publicBaseUrl, createdSession.id),
    })
  })

  // Soft-delete a mapped session for this user + project (keeps OpenCode data intact)
  app.delete("/projects/:id/sessions/:sessionId", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const sessionId = c.req.param("sessionId")
    if (!sessionId) return c.json({ error: "缺少会话 ID" }, 400)

    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const rows = await db
      .select()
      .from(schema.opencodeSession)
      .where(
        and(
          eq(schema.opencodeSession.projectId, projectId),
          eq(schema.opencodeSession.platformUserId, userId),
          eq(schema.opencodeSession.sessionId, sessionId),
          eq(schema.opencodeSession.status, "active")
        )
      )
      .limit(1)

    if (rows.length === 0) return c.json({ error: "会话不存在" }, 404)

    await db
      .update(schema.opencodeSession)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(schema.opencodeSession.id, rows[0].id))

    return c.json({ success: true, sessionId })
  })

  app.get("/projects/:id/members", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const members = await db
      .select({
        id: schema.projectMember.id,
        platformUserId: schema.projectMember.platformUserId,
        role: schema.projectMember.role,
        username: schema.platformUser.username,
        email: schema.platformUser.email,
        createdAt: schema.projectMember.createdAt,
      })
      .from(schema.projectMember)
      .innerJoin(schema.platformUser, eq(schema.projectMember.platformUserId, schema.platformUser.id))
      .where(eq(schema.projectMember.projectId, projectId))
    return c.json(members)
  })

  app.post("/projects/:id/members", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)
    if (!canManageMembers((access.membership?.role as ProjectRole) ?? null, access.superAdmin)) {
      return c.json({ error: "无权管理成员" }, 403)
    }

    const body = (await c.req.json()) as { platformUserId?: number; role?: ProjectRole }
    if (!body.platformUserId) return c.json({ error: "缺少用户" }, 400)
    const role = body.role && body.role !== "owner" ? body.role : "member"

    const existing = await db
      .select()
      .from(schema.projectMember)
      .where(
        and(
          eq(schema.projectMember.projectId, projectId),
          eq(schema.projectMember.platformUserId, body.platformUserId)
        )
      )
      .limit(1)
    if (existing.length > 0) return c.json({ error: "用户已是项目成员" }, 409)

    const inserted = await db.insert(schema.projectMember).values({
      projectId,
      platformUserId: body.platformUserId,
      role,
    })
    return c.json({ id: Number(inserted[0].insertId), platformUserId: body.platformUserId, role }, 201)
  })

  app.put("/projects/:id/members/:memberUserId", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const memberUserId = Number(c.req.param("memberUserId"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)
    if (!canManageMembers((access.membership?.role as ProjectRole) ?? null, access.superAdmin)) {
      return c.json({ error: "无权管理成员" }, 403)
    }

    const body = (await c.req.json()) as { role?: ProjectRole }
    if (!body.role) return c.json({ error: "缺少角色" }, 400)
    if (body.role === "owner") return c.json({ error: "不能直接设置为所有者，请使用转移所有权" }, 400)

    const target = await db
      .select()
      .from(schema.projectMember)
      .where(
        and(eq(schema.projectMember.projectId, projectId), eq(schema.projectMember.platformUserId, memberUserId))
      )
      .limit(1)
    if (target.length === 0) return c.json({ error: "成员不存在" }, 404)
    if (target[0].role === "owner") return c.json({ error: "不能修改所有者角色" }, 400)

    await db
      .update(schema.projectMember)
      .set({ role: body.role, updatedAt: new Date() })
      .where(eq(schema.projectMember.id, target[0].id))
    return c.json({ success: true })
  })

  app.delete("/projects/:id/members/:memberUserId", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const memberUserId = Number(c.req.param("memberUserId"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)
    if (!canManageMembers((access.membership?.role as ProjectRole) ?? null, access.superAdmin)) {
      return c.json({ error: "无权管理成员" }, 403)
    }

    const target = await db
      .select()
      .from(schema.projectMember)
      .where(
        and(eq(schema.projectMember.projectId, projectId), eq(schema.projectMember.platformUserId, memberUserId))
      )
      .limit(1)
    if (target.length === 0) return c.json({ error: "成员不存在" }, 404)
    if (target[0].role === "owner") return c.json({ error: "不能移除项目所有者" }, 400)

    await db.delete(schema.projectMember).where(eq(schema.projectMember.id, target[0].id))
    return c.json({ success: true })
  })

  // Code review: invoke OpenCode /review for a project session
  app.post("/projects/:id/review", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const project = access.project
    const directory = project.projectPath
    if (!directory) return c.json({ error: "项目路径为空" }, 400)

    const body = await c.req.json().catch(() => ({} as { sessionId?: string; arguments?: string }))
    const argumentsText = typeof body.arguments === "string" ? body.arguments.trim() : ""
    const opencode = config.subsystems.opencode

    // Empty-diff short-circuit only when reviewing default working tree
    if (!argumentsText) {
      try {
        const vcs = await getVcsDiff(opencode.baseUrl, opencode.password, directory, "git")
        const hasChanges = vcs.some(
          (f) =>
            (f.additions || 0) + (f.deletions || 0) > 0 ||
            Boolean(f.patch && (f.patch.includes("@@") || f.patch.trim().length > 0))
        )
        if (vcs.length === 0 || !hasChanges) {
          return c.json({ error: "没有可审查的 diff", empty: true }, 400)
        }
      } catch (err) {
        console.warn("VCS diff precheck failed, continuing to review:", err)
      }
    }

    let sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : ""
    if (sessionId) {
      const mapped = await db
        .select()
        .from(schema.opencodeSession)
        .where(
          and(
            eq(schema.opencodeSession.projectId, projectId),
            eq(schema.opencodeSession.platformUserId, userId),
            eq(schema.opencodeSession.sessionId, sessionId),
            eq(schema.opencodeSession.status, "active")
          )
        )
        .limit(1)
      if (mapped.length === 0) return c.json({ error: "会话不存在" }, 404)
    } else {
      try {
        sessionId = await ensureUserProjectSession(config, userId, projectId, project.name, directory)
      } catch (err) {
        console.error("Ensure session for review failed:", err)
        return c.json({ error: `打开 OpenCode 会话失败: ${(err as Error).message}` }, 502)
      }
    }

    try {
      const raw = await runSessionCommand(
        opencode.baseUrl,
        opencode.password,
        sessionId,
        "review",
        argumentsText,
        directory
      )
      const parsed = parseReviewResult(raw)
      return c.json({
        sessionId,
        projectId,
        text: parsed.text,
        risks: parsed.risks,
        parts: parsed.parts,
      })
    } catch (err) {
      console.error("OpenCode review failed:", err)
      return c.json({ error: `代码审查失败: ${(err as Error).message}` }, 502)
    }
  })

  // Session agent diffs for the current user
  app.get("/projects/:id/sessions/:sessionId/diff", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const projectId = Number(c.req.param("id"))
    const sessionId = c.req.param("sessionId")
    if (!sessionId) return c.json({ error: "缺少会话 ID" }, 400)

    const access = await assertCanAccessProject(projectId, userId)
    if (!access.ok) return c.json({ error: access.error }, access.status)

    const mapped = await db
      .select()
      .from(schema.opencodeSession)
      .where(
        and(
          eq(schema.opencodeSession.projectId, projectId),
          eq(schema.opencodeSession.platformUserId, userId),
          eq(schema.opencodeSession.sessionId, sessionId),
          eq(schema.opencodeSession.status, "active")
        )
      )
      .limit(1)
    if (mapped.length === 0) return c.json({ error: "会话不存在" }, 404)

    const directory = mapped[0].directory || access.project.projectPath || undefined
    const opencode = config.subsystems.opencode
    try {
      const files = await getSessionDiff(opencode.baseUrl, opencode.password, sessionId, directory || undefined)
      return c.json({ sessionId, projectId, files })
    } catch (err) {
      console.error("OpenCode session diff failed:", err)
      return c.json({ error: `获取 Diff 失败: ${(err as Error).message}` }, 502)
    }
  })

  // GitHub Action workflow template (no OpenCode call)
  app.get("/code-factory/github-workflow", async (c) => {
    const userId = c.get("platformUserId") as number | undefined
    if (!userId) return c.json({ error: "Unauthorized" }, 401)
    const triggers = parseGithubWorkflowTriggers({
      issueComment: c.req.query("issueComment") || undefined,
      pullRequest: c.req.query("pullRequest") || undefined,
      pullRequestReviewComment: c.req.query("pullRequestReviewComment") || undefined,
    })
    const yaml = buildGithubWorkflowYaml(triggers)
    return c.json({ triggers, yaml, filename: "opencode.yml" })
  })

  return app
}

async function ensureUserProjectSession(
  config: GatewayConfig,
  userId: number,
  projectId: number,
  projectName: string,
  directory: string
): Promise<string> {
  const mapped = await db
    .select()
    .from(schema.opencodeSession)
    .where(
      and(
        eq(schema.opencodeSession.projectId, projectId),
        eq(schema.opencodeSession.platformUserId, userId),
        eq(schema.opencodeSession.status, "active")
      )
    )
    .orderBy(asc(schema.opencodeSession.createdAt))
    .limit(1)

  if (mapped.length > 0) {
    await db
      .update(schema.opencodeSession)
      .set({ updatedAt: new Date() })
      .where(eq(schema.opencodeSession.id, mapped[0].id))
    return mapped[0].sessionId
  }

  const opencode = config.subsystems.opencode
  const existing = await listOpenCodeSessions(opencode.baseUrl, opencode.password, directory)
  let sessionId: string
  let title: string | null = null
  if (existing.length > 0) {
    sessionId = existing[0].id
    title = existing[0].title || null
  } else {
    const created = await createOpenCodeSession(
      opencode.baseUrl,
      opencode.password,
      directory,
      `${projectName} · ${new Date().toLocaleString("zh-CN")}`
    )
    sessionId = created.id
    title = created.title || null
  }

  await db.insert(schema.opencodeSession).values({
    sessionId,
    projectId,
    platformUserId: userId,
    title,
    directory,
    status: "active",
  })
  return sessionId
}

async function checkDatabase(): Promise<string> {
  try {
    await db.execute(sql`SELECT 1`)
    return "connected"
  } catch (err) {
    return "disconnected"
  }
}

async function probeHttp(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(url, { method: "GET", signal: controller.signal })
    clearTimeout(timeout)
    return res.ok || res.status < 500
  } catch {
    return false
  }
}
