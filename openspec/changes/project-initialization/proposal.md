## Why

当前代码工场的"项目初始化"只是一个占位页面，平台对"项目"没有实体管理。用户无法创建项目、指定项目目录或把项目分配给多个用户。为了支撑后续 AI 编程会话基于项目上下文工作，需要先补齐平台级的项目与成员管理能力。

## What Changes

- 废弃现有 `user_project` 表，新建 `project`、`project_member`、`project_template` 三张表。
- 实现项目 CRUD：创建、列表、详情、更新、归档/删除。
- 实现项目文件夹绝对路径管理，创建时校验目录存在性与可写性。
- 实现项目成员管理：添加、移除、修改角色（所有者 / 管理员 / 成员 / 观察者）。
- 实现项目模板选择：Web / API / 脚本 / 移动应用 / 自定义。
- 在"项目初始化"菜单下实现项目列表、新建项目弹窗、项目详情页。
- 同步更新 `方案思路.md` 中关于项目初始化的功能描述，与本次设计保持一致。
- 本版本不实现 AGENTS.md 的自动生成，仅保留模板结构为后续扩展。

## Capabilities

### New Capabilities
- `project-management`: 项目实体的创建、查询、更新、归档，以及项目文件夹绝对路径管理。
- `project-member-management`: 项目成员的增删改查与角色控制。
- `project-template`: 项目模板的管理与选择。

### Modified Capabilities
- 无现有 spec 需要修改。

## Impact

- **数据库**：`gateway/src/db/schema.ts` 增加/修改表；`gateway/src/db/seed.ts` 移除旧表相关数据；需要迁移脚本或迁移逻辑。
- **API**：`gateway/src/routes/platform.ts` 新增项目相关 REST 端点。
- **前端**：`frontend/src/pages/code-factory/ProjectInitPage.tsx` 从占位页替换为完整项目初始化页面；新增列表、弹窗、详情等组件。
- **文档**：`方案思路.md` 中项目初始化章节需要同步更新。
