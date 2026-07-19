## Context

- 后端已有 `opencode_session` 与按项目的 `GET/POST/DELETE /projects/:id/sessions`
- `ChatPage` 侧栏已覆盖「当前项目」列表/新建/软删
- `SessionListPage` 仍为占位；产品定位定为 **A：跨项目历史总览**

## Goals / Non-Goals

**Goals:**

- 一页查看「我在各项目下的活跃会话」
- 支持按项目筛选、标题/ID 搜索、打开（进 AI 编程会话）、软删
- 与侧栏职责清晰：总览找历史 → 深链进 chat；侧栏负责当前项目切换

**Non-Goals:**

- 不展示他人会话、不做运维审计（那是系统管理「会话管理」）
- 不强删 OpenCode 远端会话、不重命名/归档（本迭代不做）
- 不在本页内嵌 iframe 对话

## Decisions

### 1. 聚合 API：`GET /sessions`

- **选择**：服务端 join `opencode_session` + `project`，按当前 `platform_user_id` + `status=active` 过滤，按 `updated_at` 降序
- **备选**：前端对每个项目调 `GET /projects/:id/sessions` — N+1、慢、错误处理复杂
- **返回字段**：`id, sessionId, projectId, projectName, title, directory, status, createdAt, updatedAt, embedUrl`

### 2. 删除复用现有端点

- 总览页删除调用 `DELETE /projects/:id/sessions/:sessionId`，避免第二套删除语义

### 3. 打开用 query 深链

- 路径：`/code-factory/chat?projectId={id}&sessionId={sid}`
- `ChatPage` 加载项目后：若有 `sessionId`，用该映射的 `embedUrl` 直接进入嵌入态；若仅有 `projectId`，走现有 `open-chat`
- 打开后清理或保留 query 均可；保留便于刷新恢复

### 4. UI 布局

```
┌ 标题 + 搜索 + 刷新 ─────────────────────────┐
├ 左侧项目筛选 ──┬─ 右侧会话表格/列表 ─────────┤
│ 全部 (N)       │ 标题 · 项目 · 更新时间 · 操作 │
│ 项目A (n)      │ [打开] [删除]                 │
└────────────────┴─────────────────────────────┘
```

- 空态：引导去「AI 编程会话」或「项目初始化」
- 加载/错误态与现有代码工场页一致

## Risks / Trade-offs

- [深链时会话已被软删] → Chat 提示并回退到项目卡片或 `open-chat`
- [项目已归档/删除] → 列表仍可显示映射；打开时 `assertCanAccessProject` 失败则提示
- [会话很多] → 本迭代前端过滤即可；后续可加分页

## Migration Plan

- 无 DB 迁移；仅新增只读聚合接口 + 前端页
- 回滚：隐藏菜单或恢复占位页即可
