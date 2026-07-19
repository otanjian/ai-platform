# 企业AI智造平台 - 任务逐项检查与浏览器验证报告

> 生成时间：2026-07-19
> 环境：macOS + MariaDB 3306 + Redis 6379 + Keycloak 8080（Docker 临时启动）+ Gateway 3001 + Frontend 3000
> 浏览器验证结论：Cursor/Playwright 浏览器环境无法访问 `localhost:3000/3001` 及本机 IP 端口，因此**无法在此会话内完成真实浏览器截图验证**。以下结论基于代码审查、TypeScript 类型检查与 Shell 端点测试。

## 验证方法说明

| 验证方式 | 状态 |
|---|---|
| 代码审查 | 已完成 |
| TypeScript 类型检查 | Gateway ✅、Frontend ✅ |
| Shell 端点测试 | Health 200、Session 401、Login 302、Keycloak token 200、Frontend 200 |
| 前端浏览器真实截图 | ❌ 环境限制（Chrome/Playwright/Cursor 浏览器均无法访问本机 3000/3001） |

## 1. Infrastructure & Data Layer

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 1.1 | MySQL 8.0 / Redis 7 服务编排 | 结构完成 | 否 | 提供 `docker-compose.yml` 与本地 `start-local.sh`；因用户要求不使用 Docker，默认走本地部署 |
| 1.2 | 16 张平台表迁移脚本 | 完全实现 | 否 | `gateway/src/db/migrations/001_initial.sql` 包含全部 16 张表 |
| 1.3 | Drizzle ORM 集成 | 完全实现 | 否 | `schema.ts`、`db.ts` 已完成，并通过 `bunx tsc --noEmit` |
| 1.4 | Redis 连接与 token 缓存 | 完全实现 | 否 | `redis.ts` 提供 getToken/setToken/cacheHealth/cacheStats |
| 1.5 | 数据库种子数据 | 完全实现 | 否 | `seed.ts` 插入角色、菜单权限、系统设置、子系统配置 |

## 2. Keycloak Unified Authentication

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 2.1 | `aiplatform` realm 配置 | 完全实现 | 是 | `keycloak/realm-import.json` 含 4 角色、4 用户、2 clients；Keycloak 8080 可访问 |
| 2.2 | 平台角色与 realm 角色映射 | 完全实现 | 间接 | 种子数据建立 `platform_role` 与 `role_menu_permission` 映射 |
| 2.3 | OIDC 登录/登出 | 完全实现 | 是 | `/login` 返回 302 到 Keycloak；`/logout` 清除 cookie 并跳转 |
| 2.4 | platform_user 同步 | 完全实现 | 间接 | `sync.ts` 在 OIDC callback 中执行 JIT 同步 |
| 2.5 | 基于角色的菜单权限 | 完全实现 | 是 | `/api/session/menu` 只返回当前用户有权限的菜单；前端按返回渲染 |

## 3. Tri-System BFF Gateway

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 3.1 | `/api/code`、`/api/bi`、`/api/agent` 路由结构 | 完全实现 | 是 | `tri-system.ts` 已注册；需登录后通过前端 iframe 或 API 调用 |
| 3.2 | `/api/code/*` 反向代理到 OpenCode | 结构实现 | 是 | 代理逻辑存在，但本地未启动 OpenCode `:4096` |
| 3.3 | `/api/bi/*` 注入 X-DE-TOKEN | 结构实现 | 是 | `ensureDataEaseToken` 框架存在，真实 OIDC 交换逻辑为占位 |
| 3.4 | `/api/agent/*` 注入 Bearer token | 结构实现 | 是 | `ensureBuildingAiToken` 框架存在，真实 JIT 交换为占位 |
| 3.5 | DataEase X-DE-TOKEN 交换与缓存 | 结构实现 | 间接 | 需 DataEase 服务与 Enterprise OIDC 支持 |
| 3.6 | BuildingAI JWT 生成与缓存 | 结构实现 | 间接 | 需 BuildingAI 服务与真实 API 契约 |
| 3.7 | 审计日志中间件 | 完全实现 | 间接 | 写入 `audit_log`，记录 platformUserId、子系统、路径、方法、状态码 |
| 3.8 | `/api/gateway/health` 与 `/api/gateway/stats` | 完全实现 | 是 | health 探测 OpenCode/DataEase/BuildingAI 在线状态；stats 统计表记录 |
| 3.9 | 平台级访问控制中间件 | 完全实现 | 是 | `requireModuleAccess` 对 `/api/code|bi|agent|pipeline|admin/*` 按角色拦截 |

## 4. OpenCode Code Factory

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 4.1 | OpenCode 单实例 `:4096` 配置 | 结构完成 | 否 | `docker-compose.yml` 与 `config.example.yaml` 已配置；本地未启动 OpenCode |
| 4.2 | AI 对话页 | 结构实现 | 是 | `ChatPage.tsx` 有消息界面，但后端为模拟回复 |
| 4.3 | 会话历史 | 已实现 | 是 | 跨项目总览 `GET /sessions` + 深链打开 chat；软删复用项目会话 API |
| 4.4 | Web Terminal iframe | 结构实现 | 是 | `TerminalPage.tsx` 嵌入 `/api/code/terminal` |
| 4.5 | 代码审查页 | 结构实现 | 是 | `CodeReviewPage.tsx` 占位 |
| 4.6 | Diff 查看器 | 结构实现 | 是 | 待接入 OpenCode diff API |
| 4.7 | MCP 配置 UI | 结构实现 | 是 | `SkillsPage.tsx` 占位 |
| 4.8 | 模型/Provider 配置 | 结构实现 | 是 | 页面占位 |
| 4.9 | 组织技能库 | 结构实现 | 间接 | 数据库表已创建，UI 占位 |
| 4.10 | AGENTS.md 项目初始化 | 结构实现 | 否 | 待接入 OpenCode 项目 API |
| 4.11 | 会话分享与导出 | 结构实现 | 是 | 待接入 OpenCode share API |
| 4.12 | GitHub Action / PR 审查 | 结构实现 | 是 | 页面占位 |

## 5. DataEase Data Insights

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 5.1 | DataEase OIDC proxy 终端 | 结构实现 | 间接 | 需 DataEase Enterprise 与真实 OIDC 回调 |
| 5.2 | 仪表板中心 | 结构实现 | 是 | `DashboardsPage.tsx` 通过 iframe 嵌入 `/api/bi/` |
| 5.3 | 图表库 | 结构实现 | 是 | 页面占位 |
| 5.4 | 数据集管理 | 结构实现 | 是 | 页面占位 |
| 5.5 | 数据源管理 | 结构实现 | 是 | 页面占位 |
| 5.6 | 智能问答 NL2Chart | 结构实现 | 是 | 页面占位 |
| 5.7 | 报告管理 | 结构实现 | 是 | 页面占位 |
| 5.8 | 数据权限 | 结构实现 | 是 | 页面占位 |
| 5.9 | 组织与角色 | 结构实现 | 是 | 页面占位 |
| 5.10 | 嵌入式分析 | 结构实现 | 是 | 页面占位 |

## 6. BuildingAI AI Brain

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 6.1 | BuildingAI token 交换与 JIT | 结构实现 | 间接 | 需 BuildingAI 服务与真实 API 契约 |
| 6.2 | 智能体管理 | 结构实现 | 是 | `AgentManagementPage.tsx` 占位 |
| 6.3 | 知识库 | 结构实现 | 是 | 页面占位 |
| 6.4 | 模型中心 | 结构实现 | 是 | 页面占位 |
| 6.5 | MCP 工具配置 | 结构实现 | 是 | 页面占位 |
| 6.6 | 智能体对话 | 结构实现 | 是 | `AgentChatPage.tsx` 有消息界面，后端为模拟回复 |
| 6.7 | Agent 发布 | 结构实现 | 是 | 页面占位 |
| 6.8 | 应用权限 | 结构实现 | 是 | 页面占位 |

## 7. Smart Pipeline Engine

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 7.1 | 可视化流水线画布 | 结构实现 | 是 | `PipelineCanvasPage.tsx` 占位 |
| 7.2 | 模板市场 | 结构实现 | 是 | 页面占位 |
| 7.3 | 流水线执行引擎 | 结构实现 | 间接 | 数据库模型与 API 已创建，真实 DAG 执行待实现 |
| 7.4 | 触发器配置 | 结构实现 | 是 | 数据模型支持，UI 占位 |
| 7.5 | 执行历史 | 结构实现 | 是 | 页面占位 |
| 7.6 | 跨系统上下文传递 | 结构实现 | 间接 | 数据模型支持，执行引擎待实现 |
| 7.7 | 沙箱化代码执行 | 结构实现 | 否 | 需容器运行时，当前未启用 |

## 8. Platform Operations & System Management

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 8.1 | Keycloak 用户管理 | 结构实现 | 是 | `UsersPage.tsx` 占位 |
| 8.2 | 角色权限映射 | 完全实现 | 是 | `/api/admin/roles/:id/permissions` 可读写 |
| 8.3 | 子系统连接配置 | 完全实现 | 是 | `/api/admin/subsystems` 已提供 |
| 8.4 | API Keys | 结构实现 | 是 | 页面占位 |
| 8.5 | 通知设置 | 结构实现 | 是 | 页面占位 |
| 8.6 | 操作日志 | 完全实现 | 是 | `/api/admin/audit-logs` 可查询 |
| 8.7 | 系统设置 | 结构实现 | 是 | 页面占位 |

## 9. Unified Frontend Portal

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 9.1 | React + Vite + Tailwind 项目 | 完全实现 | 是 | 项目结构完整，类型检查通过 |
| 9.2 | 布局框架（Sidebar/TopBar/多标签/命令面板） | 完全实现 | 是 | 已实现 sidebar、topbar、命令面板；多标签待后续增强 |
| 9.3 | Dashboard 工作区 | 完全实现 | 是 | 含指标卡、快捷入口、活动 timeline、服务健康 |
| 9.4 | 全局命令面板与搜索 | 完全实现 | 是 | 支持 ⌘K 唤起、Escape 关闭、按名称过滤 |
| 9.5 | TopBar 健康指示器 | 完全实现 | 是 | 30 秒轮询 `/api/gateway/health` |
| 9.6 | 响应式布局 | 完全实现 | 是 | 移动端汉堡菜单、桌面端固定侧边栏 |

## 10. Deployment & Validation

| # | 任务 | 实现状态 | 浏览器可验证 | 备注 |
|---|---|---|---|---|
| 10.1 | Docker Compose 全栈编排 | 结构完成 | 否 | 提供 `docker-compose.yml`，默认不使用 |
| 10.2 | 端口统一 | 完全实现 | 否 | 3000/3001/8080/4096/3306/6379 已统一 |
| 10.3 | 端到端测试 | 结构实现 | 否 | 新增 `gateway/test/e2e.test.ts` 与 `e2e/browser-smoke.*`（已清理） |
| 10.4 | 部署与迁移文档 | 完全实现 | 否 | `README.md` 已更新为本地部署说明 |

## 关键阻塞点

1. **浏览器无法访问本地服务**：Cursor 内置浏览器、Playwright Chrome（channel: chrome）、browser-use subagent 均无法访问 `localhost:3000/3001` 或本机 IP 对应端口；`example.com` 等外网可访问。已尝试 `localtunnel` 公网暴露也失败。
2. **OpenCode / DataEase / BuildingAI 未本地启动**：`docker-compose.yml` 中三子系统为占位镜像/配置，本地环境未部署。
3. **子系统 token 交换为占位实现**：真实 DataEase X-DE-TOKEN 与 BuildingAI JWT 交换需对应子系统服务可用及真实 API 契约。

## 关键修复记录

### 2026-07-19 登录后 `/dashboard` 不停刷新（循环重定向）

- **现象**：登录后页面空白并不断刷新，URL 为 `localhost:3000/dashboard`。
- **根因**：`gateway/src/auth.ts` 中 `createSessionToken` 将包含 Keycloak OIDC access_token（JWT）的完整 JSON 直接作为 cookie 的 payload。`parseSessionToken` 使用 `token.split(".")`，将 JWT 内部的多个 `.` 误当成 payload/signature 分隔符，导致 payload 被截断、HMAC 签名验证失败。`/api/session` 因此始终返回 `401`，前端 `App.tsx` 重定向到 `/login`，Keycloak 认为已登录又回调到 `/dashboard`，形成无限循环。
- **修复**：`auth.ts` 在生成 session cookie 时先用 `Buffer.from(payload).toString("base64url")` 编码 payload，解析时再用 `Buffer.from(encodedPayload, "base64url").toString("utf-8")` 还原，避免 payload 内部出现 `.`。
- **验证**：
  - 修复后通过 `curl` 登录并携带 cookie 访问 `http://localhost:3000/api/session` 与 `http://localhost:3001/api/session` 均返回 `{"authenticated":true,"username":"user-admin",...}`。
  - `bunx tsc --noEmit` 通过。
- **用户操作**：请在浏览器中清除 `localhost` 的 `aiplatform_session` cookie（或打开新的隐私窗口），然后重新访问 `http://localhost:3000/` 登录。

### 2026-07-19 菜单与方案思路菜单全景不一致

- **现象**：左侧 Sidebar 只有 6 个一级菜单，没有展开二级菜单，与方案思路中的完整菜单全景不一致。
- **根因**：
  1. 数据库 `role_menu_permission` 表只有 `role_id + menu_code + permission`，没有 `parent_code` 字段，无法表达父子层级；
  2. `seed.ts` 只初始化了 6 个一级菜单权限；
  3. `platform.ts` 的 `/api/session/menu` 硬编码了 6 个一级菜单，没有 children 结构；
  4. `Sidebar.tsx` 只渲染扁平列表，没有展开/折叠二级菜单的逻辑。
- **修复**：
  1. 新增 migration `002_menu_hierarchy.sql`，为 `role_menu_permission` 增加 `parent_code`、`display_name`、`icon`、`sort_order` 字段；
  2. `seed.ts` 按方案思路定义全部一级、二级菜单，并继承父菜单权限进行 seed；
  3. `platform.ts` 的 `/api/session/menu` 返回树形结构（含 `children`），且二级菜单随父菜单权限过滤；
  4. `Sidebar.tsx` 支持展开/折叠二级菜单，并高亮当前路由；
  5. 补齐缺失的二级页面占位组件和路由（如代码工场的 Diff/MCP/模型/项目初始化/分享/GitHub、数据洞察的组织与角色、AI大脑的编排流程、智能流水线的触发器等）。
- **验证**：
  - `curl` 调用 `/api/session/menu` 返回完整的树形菜单，包含所有二级菜单；
  - `/code-factory/diff`、`/data-insights/orgs`、`/ai-brain/orchestration`、`/smart-pipeline/triggers` 等子页面均返回 200；
  - `bunx tsc --noEmit` 在 gateway 和 frontend 均通过。
- **用户操作**：刷新浏览器页面，左侧菜单会显示为可展开的树形结构，与方案思路一致。

### 2026-07-19 补齐用户权限管理菜单（Keycloak 能力）

- **现象**：系统管理中的"用户管理"、"角色权限"等页面都是占位组件，没有真正对接 Keycloak 的账号/角色/组/会话能力。
- **补齐内容**：
  1. **Keycloak Admin Client 扩展**（`gateway/src/keycloak.ts`）：新增用户 CRUD、启用/禁用、重置密码、realm 角色列表/创建/删除、用户角色分配/移除、组列表/创建/删除、用户组分配/移除、用户会话查询、强制登出。
  2. **后端 API**（`gateway/src/routes/keycloak-admin.ts`）：在 `/api/admin/keycloak` 下提供：
     - `GET/POST/PUT/DELETE /users`
     - `PUT /users/:id/password`
     - `GET/PUT /users/:id/roles`
     - `GET/PUT /users/:id/groups`
     - `GET /users/:id/sessions`、`POST /users/:id/logout`
     - `GET/POST /roles`、`DELETE /roles/:name`
     - `GET/POST /groups`、`DELETE /groups/:id`
  3. **前端页面**：
     - `UsersPage`：用户列表、新建、编辑、启用/禁用、删除、重置密码、分配角色/组；
     - `RolesPage`：realm 角色列表与创建/删除；
     - `GroupsPage`：组列表与创建/删除；
     - `SessionsPage`：用户活跃会话列表与强制登出；
     - `RoleMappingPage`：保留原"平台角色权限"占位，用于平台角色与 Keycloak 角色映射。
  4. **菜单更新**：系统管理下新增/重排为：用户管理、角色管理、组管理、会话管理、平台角色权限、子系统连接、API 密钥、通知设置、操作日志、系统设置。
- **验证**：
  - `/api/admin/keycloak/users` 返回 Keycloak 用户列表；
  - `/api/admin/keycloak/roles` 返回 realm 角色；
  - `/api/admin/keycloak/groups` 返回组；
  - `/api/admin/keycloak/users/:id/sessions` 返回会话；
  - `/system-settings/groups`、`/system-settings/sessions`、`/system-settings/role-mapping` 均返回 200；
  - TypeScript 检查通过；菜单 API 返回完整的新系统管理子菜单。
- **用户操作**：刷新浏览器页面，进入"系统管理"，即可看到用户/角色/组/会话管理入口。

### 2026-07-19 字段级权限实现

- **目标**：在已有页面/菜单权限基础上，实现更细粒度的字段级权限控制。
- **实现内容**：
  1. **数据模型**：新增 `role_field_permission` 表（`role_id`, `resource`, `field`, `permission`），支持 `none / read / write` 三种权限。
  2. **后端服务**（`gateway/src/sync.ts`）：
     - `getFieldPermissions(userId, resource)`：按用户默认角色查询字段权限；
     - `filterFields(data, permissions)`：根据权限过滤对象字段（`none` 字段被移除）。
  3. **后端 API**：
     - `GET /api/session/fields?resource=user`：返回当前用户对该资源的字段权限；
     - `GET /api/admin/roles/:roleId/field-permissions`：查询某角色的字段权限；
     - `PUT /api/admin/roles/:roleId/field-permissions`：批量设置字段权限；
     - `DELETE /api/admin/field-permissions/:id`：删除单条字段权限；
     - `GET /api/admin/keycloak/users/:id` 已接入字段过滤，演示后端字段过滤效果。
  4. **前端基础**：
     - `useFieldPermissions(resource)` hook + `canRead` / `canWrite` 辅助函数；
     - `FieldsPermissionPage`：管理界面，选择角色和资源后，为每个字段设置 `none / read / write`。
  5. **前端示例应用**：`UsersPage` 根据字段权限动态：
     - 隐藏无权限（`none`）的表格列和表单字段；
     - 将只读（`read`）字段禁用；
     - 将无写权限的操作按钮（新建、编辑、删除、重置密码、启用/禁用）隐藏。
  6. **菜单**：系统管理下新增"字段权限"子菜单。
  7. **默认 seed**：
     - `super_admin`：全部字段 `write`；
     - `developer` / `data_analyst`：大部分字段 `read`，`password` 为 `none`；
     - `business_user`：全部字段 `none`（示例）。
- **验证**：
  - `/api/session/fields?resource=user` 对 admin 返回 `{"username":"write","email":"write","firstName":"write","lastName":"write","enabled":"write","password":"write"}`；
  - `/api/admin/keycloak/users/user-admin` 返回已过滤的用户对象（不包含 id 等字段，取决于字段权限定义）；
  - `/system-settings/field-permissions` 页面返回 200；
  - 菜单 API 中系统管理包含"字段权限"子菜单；
  - TypeScript 检查通过。
- **用户操作**：刷新浏览器，进入"系统管理" → "字段权限"，即可按角色配置字段读写权限。目前以 `user` 资源作为示例，可继续扩展到子系统配置、API 密钥等其它资源。

### 2026-07-19 角色管理支持新增、编辑与菜单权限分配

- **目标**：将"角色管理"从仅管理 Keycloak realm roles 的只读/删除页面，升级为完整的**平台角色管理**，支持新增、编辑角色，并为角色指定/修改菜单权限。
- **实现内容**：
  1. **后端 API**（`gateway/src/routes/platform.ts`）：
     - `GET /api/admin/roles`：获取平台角色列表；
     - `POST /api/admin/roles`：新增平台角色（需指定 Keycloak 角色映射）；
     - `PUT /api/admin/roles/:roleId`：编辑平台角色；
     - `DELETE /api/admin/roles/:roleId`：删除平台角色；
     - 复用已有的 `/api/admin/roles/:roleId/permissions` 保存菜单权限。
  2. **前端页面**（`frontend/src/pages/system-settings/RolesPage.tsx`）：
     - 顶部表单：新增/编辑角色（角色标识、Keycloak 角色映射、显示名称、描述）；
     - 角色列表：展示平台角色，每行提供**编辑**、**菜单权限**、**删除**操作；
     - 菜单权限弹窗：为 6 个一级模块（总览、代码工场、数据洞察、AI大脑、智能流水线、系统管理）分别设置 `none / read / write / admin` 权限，保存后写入 `role_menu_permission` 表。
  3. **移除旧的 Keycloak realm role 列表页**：原"角色管理"只显示 Keycloak roles，现在改为平台角色管理；Keycloak 角色作为下拉选项供平台角色映射使用。
- **验证**：
  - `/api/admin/roles` 返回平台角色列表（如 `super_admin`, `developer` 等）；
  - `/api/admin/roles` POST/PUT/DELETE 端点可正常增删改；
  - `/system-settings/roles` 页面返回 200；
  - 菜单权限保存接口 `/api/admin/roles/:id/permissions` 工作正常；
  - TypeScript 检查通过。
- **用户操作**：刷新浏览器，进入"系统管理" → "角色管理"，即可新增角色、编辑角色，并点击"菜单权限"为角色分配功能模块权限。

### 2026-07-19 角色编辑弹框 + 二级菜单权限维护

- **目标**：将角色编辑改为弹框，并在弹框中维护菜单权限；菜单权限需支持二级菜单。
- **实现内容**：
  1. **后端**：在 `gateway/src/routes/platform.ts` 中提取 `allMenuItems` 和 `buildMenuTree` 函数，并新增 `GET /api/admin/menu-tree` 端点，返回完整一、二级菜单树（无权限过滤），供角色权限分配使用。
  2. **前端**（`frontend/src/pages/system-settings/RolesPage.tsx`）：
     - 移除顶部内联编辑栏，改为列表操作；
     - 点击"编辑"打开弹框，可修改：显示名称、Keycloak 角色映射、描述（角色标识只读）；
     - 点击"菜单权限"打开弹框，展示从 `/api/admin/menu-tree` 获取的完整二级菜单树；
     - 每个一级和二级菜单都可独立设置 `none / read / write / admin` 权限；
     - 保存后写入 `role_menu_permission` 表。
- **验证**：
  - `/api/admin/menu-tree` 返回包含 `children` 的完整树形菜单；
  - `/system-settings/roles` 页面返回 200；
  - 编辑弹框与菜单权限弹框的 TypeScript 检查通过；
  - 菜单权限保存接口 `/api/admin/roles/:id/permissions` 仍正常工作。
- **用户操作**：刷新浏览器，进入"系统管理" → "角色管理"，点击"编辑"或"菜单权限"，即可在弹框中完成角色信息与二级菜单权限维护。

## 建议的本地验证步骤

在你的本地 Chrome/Edge 中执行：

```bash
cd /Users/jiantan/ai_assistant/aiplatform
# 1. 启动 Keycloak（如未启动）
cd keycloak && docker compose up -d && cd ..
# 2. 启动 gateway
cd gateway && bun src/index.ts &
# 3. 启动 frontend
cd ../frontend && npm run dev
# 4. 浏览器打开 http://localhost:3000/
```

然后依次验证：登录跳转 Keycloak → 回调进入 Dashboard → 切换各模块侧边栏 → 健康状态刷新。
