## Why

菜单「会话列表」页仍是占位文案，而会话管理能力已在「AI 编程会话」侧栏内实现，导致菜单入口无独立价值。需要把该页定位为**跨项目会话历史总览**，与侧栏（当前项目即时操作）互补。

## What Changes

- 新增平台 API：`GET /sessions`，返回当前用户在所有项目下的活跃 `opencode_session` 映射（含项目名、`embedUrl`）
- 实现 `/code-factory/sessions` 交互页：按项目筛选、搜索、打开、软删
- 「打开」深链到 `/code-factory/chat?projectId=&sessionId=`，由 AI 编程会话页恢复嵌入
- 同步更新 `方案思路.md` 中会话列表/历史的定位与能力描述
- Chat 侧栏行为保持不变（仍管当前项目）

## Capabilities

### New Capabilities

- `session-history-overview`: 跨项目「我的会话」总览（列表、筛选、搜索、打开、软删）及对应 API

### Modified Capabilities

- （无主库 `openspec/specs/` 条目；本变更以 change 内新 capability 为准）

## Impact

- **Gateway**：`platform.ts` 新增 `GET /sessions`；复用现有 `DELETE /projects/:id/sessions/:sessionId`
- **Frontend**：`SessionListPage.tsx` 实装；`ChatPage.tsx` 支持 query 深链打开指定会话
- **Docs**：`方案思路.md` 会话列表章节与能力矩阵
- **OpenCode**：无改动；删除仍为本平台软删
