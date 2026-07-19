## Context

平台已有 Keycloak 统一认证、`platform_user`、菜单权限，以及极简的 `user_project`（用户 → 项目名/路径，一对多）。「项目初始化」前端仅为占位页。OpenCode 使用服务器上的真实工作目录；本变更把项目升级为可共享的工作空间实体，数据存本平台 MySQL。

约束：
- 项目路径为服务器绝对路径
- 多用户共享同一项目
- 角色：owner / admin / member / viewer（UI 中文：所有者 / 管理员 / 成员 / 观察者）
- 模板不做组织强制隔离；AGENTS.md 生成本阶段不做

## Goals / Non-Goals

**Goals:**
- 提供项目 CRUD、成员管理、模板选择（创建时）
- MySQL 模型：`project`、`project_member`、`project_template`
- 从 `user_project` 迁移并删除旧表
- 前端「项目初始化」完整列表 + 新建向导 + 详情/成员管理
- 同步更新 `方案思路.md`

**Non-Goals:**
- AGENTS.md / OpenCode `/init` 生成
- 文件系统 ACL 同步（仅平台侧成员关系；路径存在性做基础校验）
- 组织级模板隔离策略
- OpenCode 会话与项目的深度绑定（已另见 change `add-opencode-session-binding`）

## Decisions

### 1. 独立 `project` 实体 + `project_member` 多对多
- **Why**：共享项目要求项目与用户解耦；旧 `user_project` 无法表达多成员。
- **Alternatives**：在 `user_project` 加 JSON members → 查询/约束差；拒绝。

### 2. `project_path` UNIQUE
- **Why**：同一绝对路径不应注册为两个项目，避免成员权限冲突。
- **Alternatives**：允许重复路径 → 运营混乱；拒绝。

### 3. 创建时路径校验：存在且为目录
- **Why**：路径是直接工作目录；不存在时提示错误（不自动 mkdir，避免误建）。
- **Alternatives**：自动创建目录 → 本阶段不做。

### 4. 角色存储英文 enum，UI 映射中文
- **Why**：与现有 schema 风格一致；展示层本地化。
- **Mapping**：owner→所有者，admin→管理员，member→成员，viewer→观察者。

### 5. 权限模型
- 菜单：沿用 `code_factory.project_init`（开发者 write、超管 admin）。
- 项目级：列表仅返回当前用户为成员的项目；超管可看全部。
- 写操作：owner/admin 可改项目与成员；owner 不可被移除且唯一；转移所有权仅 owner。

### 6. API 挂在 gateway `/api/...`（platform router）
```
GET/POST     /projects
GET/PUT/DELETE /projects/:id
GET/POST     /projects/:id/members
PUT/DELETE   /projects/:id/members/:userId
GET          /project-templates
```
- DELETE 项目默认软删（status=deleted）或归档；硬删仅超管可选。本阶段：归档 `archived` + 列表默认过滤，删除走 `deleted`。

### 7. `project_template` 预置 Web/API/脚本等种子
- 创建时可选用；`extra_config` 预留，不写 AGENTS.md。

### 8. 迁移
1. 建新表
2. 每条 `user_project` → 一个 `project`（owner=`platform_user_id`）+ 一条 `project_member`(role=owner)
3. 路径冲突：后出现的记录加后缀或跳过并记日志
4. Drop `user_project`

## Risks / Trade-offs

- **[Risk] 路径仅平台记录，未改 OS 权限** → Mitigation：文档说明；OpenCode 进程用户需本就有目录访问权
- **[Risk] 迁移路径冲突** → Mitigation：迁移脚本检测 unique 冲突并跳过/重命名
- **[Risk] 超管绕过成员可见性** → Mitigation：明确产品规则：超管全量可见，便于运维

## Migration Plan

1. 部署含新 schema 的 gateway，跑 migrate + data migration
2. 部署前端新页
3. 回滚：保留迁移备份表 `user_project_backup`（可选）一版；本实现可在迁移中先 rename `user_project` → `user_project_legacy` 再 drop（简化：直接 migrate + drop）

## Open Questions

- 无阻塞项；OpenCode 会话绑定项目留待后续变更
