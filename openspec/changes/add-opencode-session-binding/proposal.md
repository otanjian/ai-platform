## Why

项目工作空间已可分配给用户，但「AI 编程会话」需要把用户、项目与 OpenCode `sessionId` 绑定：点击项目进入对应会话、按会话过滤、在平台侧管理「我的会话」。会话实体仍由 OpenCode 持有；本平台只存映射并 iframe 嵌入，不改 OpenCode 源码。

## What Changes

- 新增 MySQL 表 `opencode_session`（用户 × 项目 → OpenCode sessionId）
- Gateway API：
  - `POST /projects/:id/open-chat`：打开或创建首个会话并落库
  - `GET/POST /projects/:id/sessions`：列出 / 强制新建
  - `DELETE /projects/:id/sessions/:sessionId`：本平台软删除
- 前端 `ChatPage`：项目卡片 → 嵌入会话；「会话列表」侧栏（切换/新建/删除）；「切换项目」；嵌入区裁切顶栏、可选隐藏右侧文件变更区
- 同步 `方案思路.md` 中 AI 编程会话 / 会话列表 / DDL / 能力矩阵

## Capabilities

### New Capabilities
- `opencode-session-binding`: 将 OpenCode 会话 ID 映射到平台用户与项目，支持打开、列表、新建、软删与 iframe 嵌入

### Modified Capabilities
- （无已归档主规格变更）

## Impact

- **Gateway**：`schema.ts`、`005_opencode_session.sql`、`opencode-client.ts`、`platform.ts`
- **Frontend**：`ChatPage.tsx`（`/code-factory/chat`）
- **文档**：`方案思路.md`；本 change 规格与任务
- **非目标**：不修改 OpenCode 仓库代码；删除不为强删远端会话
