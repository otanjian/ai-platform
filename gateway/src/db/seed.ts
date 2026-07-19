import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { db } from "./db.js";
import * as schema from "./schema.js";
import { eq, and } from "drizzle-orm";

// seed.ts lives in gateway/src/db → four levels up is the sibling workspace root (ai_assistant)
const defaultWorkspaceRoot =
  process.env.PROJECT_WORKSPACE_ROOT ||
  resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

async function seed() {
  // Seed platform roles
  const roles = [
    { name: "super_admin", keycloakRoleName: "aiplatform-super-admin", displayName: "超级管理员", description: "全部权限" },
    { name: "developer", keycloakRoleName: "aiplatform-developer", displayName: "开发者", description: "代码工场 + 系统管理只读" },
    { name: "data_analyst", keycloakRoleName: "aiplatform-data-analyst", displayName: "数据分析师", description: "数据洞察 + AI大脑" },
    { name: "business_user", keycloakRoleName: "aiplatform-business-user", displayName: "业务用户", description: "AI大脑 + 智能流水线只执行" },
  ];

  for (const role of roles) {
    const existing = await db.select().from(schema.platformRole).where(eq(schema.platformRole.name, role.name));
    if (existing.length === 0) {
      await db.insert(schema.platformRole).values(role);
    }
  }

  // Define full menu hierarchy aligned with 方案思路 menu panorama
  const allMenuItems = [
    { code: "dashboard", label: "总览", icon: "LayoutDashboard", path: "/dashboard", parent: null, sort: 1 },
    { code: "code_factory", label: "代码工场", icon: "Code2", path: "/code-factory", parent: null, sort: 2 },
    { code: "code_factory.chat", label: "AI 编程会话", icon: "MessageSquare", path: "/code-factory/chat", parent: "code_factory", sort: 1 },
    { code: "code_factory.sessions", label: "会话列表", icon: "List", path: "/code-factory/sessions", parent: "code_factory", sort: 2 },
    { code: "code_factory.review", label: "代码审查", icon: "GitPullRequest", path: "/code-factory/review", parent: "code_factory", sort: 3 },
    { code: "code_factory.diff", label: "变更 Diff", icon: "FileDiff", path: "/code-factory/diff", parent: "code_factory", sort: 4 },
    { code: "code_factory.project_init", label: "项目初始化", icon: "Rocket", path: "/code-factory/project-init", parent: "code_factory", sort: 5 },
    { code: "code_factory.github", label: "GitHub 自动化", icon: "Github", path: "/code-factory/github", parent: "code_factory", sort: 6 },
    { code: "code_factory.config", label: "配置管理", icon: "Settings", path: "/code-factory/config", parent: "code_factory", sort: 7 },
    { code: "data_insights", label: "数据洞察", icon: "BarChart3", path: "/data-insights", parent: null, sort: 3 },
    { code: "data_insights.dashboards", label: "仪表板中心", icon: "LayoutTemplate", path: "/data-insights/dashboards", parent: "data_insights", sort: 1 },
    { code: "data_insights.charts", label: "图表库", icon: "PieChart", path: "/data-insights/charts", parent: "data_insights", sort: 2 },
    { code: "data_insights.datasets", label: "数据集", icon: "Database", path: "/data-insights/datasets", parent: "data_insights", sort: 3 },
    { code: "data_insights.smart_qa", label: "智能问数", icon: "Sparkles", path: "/data-insights/smart-qa", parent: "data_insights", sort: 4 },
    { code: "data_insights.reports", label: "报表管理", icon: "FileText", path: "/data-insights/reports", parent: "data_insights", sort: 5 },
    { code: "data_insights.datasources", label: "数据源管理", icon: "Server", path: "/data-insights/datasources", parent: "data_insights", sort: 6 },
    { code: "data_insights.permissions", label: "数据权限", icon: "Shield", path: "/data-insights/permissions", parent: "data_insights", sort: 7 },
    { code: "data_insights.orgs", label: "组织与角色", icon: "Users", path: "/data-insights/orgs", parent: "data_insights", sort: 8 },
    { code: "data_insights.embedded", label: "嵌入式分析", icon: "Code", path: "/data-insights/embedded", parent: "data_insights", sort: 9 },
    { code: "ai_brain", label: "AI大脑", icon: "Brain", path: "/ai-brain", parent: null, sort: 4 },
    { code: "ai_brain.agents", label: "智能体管理", icon: "Bot", path: "/ai-brain/agents", parent: "ai_brain", sort: 1 },
    { code: "ai_brain.knowledge", label: "知识库", icon: "Library", path: "/ai-brain/knowledge", parent: "ai_brain", sort: 2 },
    { code: "ai_brain.models", label: "模型中心", icon: "Cpu", path: "/ai-brain/models", parent: "ai_brain", sort: 3 },
    { code: "ai_brain.mcp", label: "MCP 工具", icon: "Wrench", path: "/ai-brain/mcp", parent: "ai_brain", sort: 4 },
    { code: "ai_brain.chat", label: "Agent 对话", icon: "MessagesSquare", path: "/ai-brain/chat", parent: "ai_brain", sort: 5 },
    { code: "ai_brain.publish", label: "Agent 发布", icon: "Rocket", path: "/ai-brain/publish", parent: "ai_brain", sort: 6 },
    { code: "ai_brain.permissions", label: "应用权限", icon: "Lock", path: "/ai-brain/permissions", parent: "ai_brain", sort: 7 },
    { code: "ai_brain.orchestration", label: "编排流程可视化", icon: "Network", path: "/ai-brain/orchestration", parent: "ai_brain", sort: 8 },
    { code: "smart_pipeline", label: "智能流水线", icon: "Workflow", path: "/smart-pipeline", parent: null, sort: 5 },
    { code: "smart_pipeline.canvas", label: "流水线画布", icon: "Paintbrush", path: "/smart-pipeline/canvas", parent: "smart_pipeline", sort: 1 },
    { code: "smart_pipeline.templates", label: "模板市场", icon: "Store", path: "/smart-pipeline/templates", parent: "smart_pipeline", sort: 2 },
    { code: "smart_pipeline.history", label: "执行历史", icon: "History", path: "/smart-pipeline/history", parent: "smart_pipeline", sort: 3 },
    { code: "smart_pipeline.triggers", label: "触发器配置", icon: "Clock", path: "/smart-pipeline/triggers", parent: "smart_pipeline", sort: 4 },
    { code: "system_settings", label: "系统管理", icon: "Settings", path: "/system-settings", parent: null, sort: 6 },
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
  ];

  // Parent menu permissions per role. Sub-menus inherit the same permission as their parent.
  const parentPermissions = [
    { role: "super_admin", menu: "dashboard", permission: "admin" },
    { role: "super_admin", menu: "code_factory", permission: "admin" },
    { role: "super_admin", menu: "data_insights", permission: "admin" },
    { role: "super_admin", menu: "ai_brain", permission: "admin" },
    { role: "super_admin", menu: "smart_pipeline", permission: "admin" },
    { role: "super_admin", menu: "system_settings", permission: "admin" },
    { role: "developer", menu: "dashboard", permission: "read" },
    { role: "developer", menu: "code_factory", permission: "write" },
    { role: "developer", menu: "smart_pipeline", permission: "read" },
    { role: "developer", menu: "system_settings", permission: "read" },
    { role: "data_analyst", menu: "dashboard", permission: "read" },
    { role: "data_analyst", menu: "data_insights", permission: "write" },
    { role: "data_analyst", menu: "ai_brain", permission: "write" },
    { role: "data_analyst", menu: "smart_pipeline", permission: "write" },
    { role: "business_user", menu: "dashboard", permission: "read" },
    { role: "business_user", menu: "data_insights", permission: "read" },
    { role: "business_user", menu: "ai_brain", permission: "read" },
    { role: "business_user", menu: "smart_pipeline", permission: "read" },
  ];

  const roleRows = await db.select().from(schema.platformRole);
  const roleMap = new Map(roleRows.map((r) => [r.name, r.id]));

  // Expand parent permissions into all menu items (parents + children)
  const menuPermissions: Array<{ role: string; menu: string; permission: string; parent: string | null; displayName: string; icon: string; sort: number }> = [];
  for (const pp of parentPermissions) {
    const item = allMenuItems.find((m) => m.code === pp.menu);
    if (!item) continue;
    menuPermissions.push({ role: pp.role, menu: item.code, permission: pp.permission, parent: item.parent, displayName: item.label, icon: item.icon, sort: item.sort });
    for (const child of allMenuItems.filter((m) => m.parent === pp.menu)) {
      menuPermissions.push({ role: pp.role, menu: child.code, permission: pp.permission, parent: child.parent, displayName: child.label, icon: child.icon, sort: child.sort });
    }
  }

  for (const mp of menuPermissions) {
    const roleId = roleMap.get(mp.role);
    if (!roleId) continue;
    const existing = await db
      .select()
      .from(schema.roleMenuPermission)
      .where(
        and(
          eq(schema.roleMenuPermission.roleId, roleId),
          eq(schema.roleMenuPermission.menuCode, mp.menu)
        )
      );
    if (existing.length === 0) {
      await db.insert(schema.roleMenuPermission).values({
        roleId,
        menuCode: mp.menu,
        parentCode: mp.parent,
        displayName: mp.displayName,
        icon: mp.icon,
        sortOrder: mp.sort,
        permission: mp.permission as any,
      });
    }
  }

  // Seed field-level permissions (example: user resource)
  const fieldDefinitions = [
    { resource: "user", fields: ["username", "email", "firstName", "lastName", "enabled", "password"] },
  ];
  const fieldRoleRules = [
    { role: "super_admin", defaultPermission: "write" },
    { role: "developer", defaultPermission: "read" },
    { role: "data_analyst", defaultPermission: "read" },
    { role: "business_user", defaultPermission: "none" },
  ];
  for (const rule of fieldRoleRules) {
    const roleId = roleMap.get(rule.role);
    if (!roleId) continue;
    for (const def of fieldDefinitions) {
      for (const field of def.fields) {
        const permission = rule.role === "developer" && field === "password" ? "none" : rule.defaultPermission;
        const existing = await db
          .select()
          .from(schema.roleFieldPermission)
          .where(
            and(
              eq(schema.roleFieldPermission.roleId, roleId),
              eq(schema.roleFieldPermission.resource, def.resource),
              eq(schema.roleFieldPermission.field, field)
            )
          );
        if (existing.length === 0) {
          await db.insert(schema.roleFieldPermission).values({
            roleId,
            resource: def.resource,
            field,
            permission: permission as any,
          });
        }
      }
    }
  }

  // Seed system settings
  const settings = [
    { settingKey: "platform.name", settingValue: "企业AI智造平台", description: "平台名称" },
    { settingKey: "platform.logo", settingValue: "/logo.svg", description: "平台 Logo" },
    { settingKey: "platform.defaultLanguage", settingValue: "zh-CN", description: "默认语言" },
    {
      settingKey: "project.workspaceRoot",
      settingValue: defaultWorkspaceRoot,
      description: "项目路径下拉扫描的工作区根目录",
    },
  ];

  for (const setting of settings) {
    const existing = await db.select().from(schema.systemSetting).where(eq(schema.systemSetting.settingKey, setting.settingKey));
    if (existing.length === 0) {
      await db.insert(schema.systemSetting).values(setting);
    }
  }

  // Seed subsystem configs (default URLs)
  const subsystems = [
    { system: "opencode", baseUrl: "http://opencode:4096", authType: "none" },
    { system: "dataease", baseUrl: "http://dataease:8100", authType: "oidc" },
    { system: "buildingai", baseUrl: "http://buildingai:4091", authType: "token" },
  ];

  for (const sub of subsystems) {
    const existing = await db.select().from(schema.subsystemConfig).where(eq(schema.subsystemConfig.system, sub.system as any));
    if (existing.length === 0) {
      await db.insert(schema.subsystemConfig).values(sub as any);
    }
  }

  // Seed built-in project templates
  const templates = [
    { name: "Web 应用", description: "标准前端 Web 项目模板", type: "web", defaultProjectPath: "/data/projects/web-app", extraConfig: {} },
    { name: "API 服务", description: "后端 API 服务项目模板", type: "api", defaultProjectPath: "/data/projects/api-service", extraConfig: {} },
    { name: "脚本工具", description: "命令行脚本或数据处理工具模板", type: "script", defaultProjectPath: "/data/projects/script-tool", extraConfig: {} },
    { name: "移动应用", description: "移动端应用项目模板", type: "mobile", defaultProjectPath: "/data/projects/mobile-app", extraConfig: {} },
    { name: "自定义项目", description: "空白自定义项目模板", type: "custom", defaultProjectPath: "/data/projects/custom-project", extraConfig: {} },
  ];

  for (const template of templates) {
    const existing = await db.select().from(schema.projectTemplate).where(eq(schema.projectTemplate.name, template.name));
    if (existing.length === 0) {
      await db.insert(schema.projectTemplate).values(template as any);
    }
  }

  console.log("Database seed completed successfully.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
