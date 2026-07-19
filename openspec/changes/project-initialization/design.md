## Context

当前平台的"代码工场 / 项目初始化"菜单对应的页面只是一个占位组件，没有实际功能。数据库中虽然存在 `user_project` 表，但它是早期的一对多设计：一个用户可拥有多个项目，无法表达多用户共享一个项目的场景，也没有模板、角色、生命周期等概念。

为了支撑后续 AI 编程会话按项目上下文工作，需要先建立平台级的项目实体，并提供项目目录管理、成员分配、模板选择等基础能力。

## Goals / Non-Goals

**Goals:**
- 建立 `project` 实体表，支持项目名、描述、绝对路径、状态、所有者、模板。
- 建立 `project_member` 关系表，支持多用户共享项目，并区分角色。
- 建立 `project_template` 表，提供 Web / API / 脚本 / 移动应用 / 自定义五类模板。
- 实现项目初始化页面：项目列表、新建项目弹窗、项目详情与成员管理。
- 实现后端 REST API 支持项目 CRUD 与成员管理。
- 迁移旧 `user_project` 数据到新的 `project` + `project_member` 模型。
- 同步更新 `方案思路.md` 中项目初始化的描述，使其与本次设计一致。

**Non-Goals:**
- 本版本不实现 AGENTS.md 的自动生成（模板字段保留用于后续扩展）。
- 不实现项目级别的细粒度权限（如按文件/目录控制）。
- 不实现项目与 Git 仓库、CI/CD 的集成。
- 不修改 OpenCode 本身的进程隔离模型，仅在平台层记录共享关系。

## Decisions

### 1. 使用独立 `project` 表而非扩展 `user_project`
- **Rationale**：旧表是用户-项目的一对多关系，主键语义属于用户。新设计以项目为中心，再通过 `project_member` 表达多对多关系，更符合"共享项目"的需求。
- **Alternatives considered**：在 `user_project` 上加 `is_owner` 等字段，但会导致项目基本信息重复、约束困难。

### 2. 项目路径使用服务器绝对路径
- **Rationale**：用户明确采用直接路径。绝对路径对 OpenCode 工作目录最直接，便于后端校验目录存在性和可写性。
- **Path validation**：创建项目时后端检查 `project_path` 是否存在；若不存在则提示用户创建；若不可写则拒绝。
- **Alternatives considered**：相对路径需要平台维护一个根目录映射，增加了配置复杂度。

### 3. 角色内部用英文枚举，界面展示中文
- **Rationale**：数据库枚举值用英文（owner/admin/member/viewer）便于代码维护；界面显示"所有者 / 管理员 / 成员 / 观察者"符合中文用户习惯。

### 4. 项目模板先内置，不强制按组织隔离
- **Rationale**：用户表示"不管"模板管理范围。设计保留 `organization_id` 字段，但初始实现仅提供全局内置模板，允许未来扩展为组织级模板。
- **Alternatives considered**：完全按组织隔离会引入更多管理界面，超出当前范围。

### 5. 创建项目时同步写入项目创建者为所有者成员
- **Rationale**：保证项目始终至少有一名所有者，避免孤儿项目。创建者自动获得 `owner` 角色，且不可移除。

### 6. 前端直接替换现有 `ProjectInitPage` 占位组件
- **Rationale**：保持现有路由 `/code-factory/project-init` 和菜单结构不变，减少路由改动。页面内部拆分为列表、弹窗、详情等子组件。

## Risks / Trade-offs

- **[Risk] 多用户共享同一目录可能与 OpenCode 多用户实例隔离冲突** → 平台目前仅记录共享关系，实际文件访问仍由部署环境保证。后续若需要严格隔离，应引入文件锁或 workspace 快照机制。
- **[Risk] 绝对路径冲突** → 通过 `project_path` 唯一索引避免；创建时若路径已被其他项目使用则拒绝。
- **[Risk] 迁移旧 `user_project` 数据时可能丢失 `is_default` 语义** → 将旧记录映射为 `project`，并将原用户作为 `owner`；若后续需要默认项目，可在 `project_member` 中加 `is_default` 字段。
- **[Risk] 删除/归档项目的权限控制** → 仅所有者可以删除；管理员和成员只能查看/使用。删除时做软删除（`status = deleted`）以保留审计记录。

## Migration Plan

1. 数据库迁移：
   - 创建 `project`、`project_member`、`project_template` 表。
   - 迁移数据：遍历 `user_project`，每条记录生成一条 `project` 和一条 `project_member`（role = owner）。
   - 删除旧 `user_project` 表（或保留空表并在后续清理）。
2. 后端：新增项目相关路由，不影响现有平台其他路由。
3. 前端：替换 `ProjectInitPage.tsx`，新增项目组件。
4. 文档：更新 `方案思路.md` 中项目初始化章节。

## Open Questions

- 是否需要项目级审计日志？当前平台已有 `audit_log`，可以复用记录项目创建/成员变更事件。
- 项目归档后是否允许重新激活？本设计按 `status` 枚举支持，前端可先隐藏归档项目。
