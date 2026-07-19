## Context

依赖已完成的 `add-project-workspace-management`（`project` / `project_member`）。OpenCode 以项目绝对路径（`directory`）组织会话。平台需按「当前用户 + 项目」记录会话 ID，用于打开嵌入页与后续过滤。

## Goals / Non-Goals

**Goals:**
- 点击已分配项目 → 打开首个已映射会话；无映射则复用目录下最早 OpenCode 会话或新建，并写入 `opencode_session`
- 会话侧栏：列表、新建、切换、软删（仅本库）
- iframe 嵌入 OpenCode session URL；平台侧裁切顶栏 / 可选裁切右侧变更区（不改 OpenCode）

**Non-Goals:**
- 修改 OpenCode 源码或重建其 Web UI
- 硬删除 OpenCode 远端会话
- 跨用户共享同一映射行（每人各自绑定）

## Decisions

### 1. 映射表 `opencode_session`
- 唯一键：`session_id`
- 查询维度：`(platform_user_id, project_id)` + `status=active`
- 删除：`status=deleted` 软删

### 2. `open-chat` 解析顺序
1. 本库该用户该项目最早绑定会话
2. 否则 OpenCode `list sessions?directory=` 按 `created` 升序取第一条
3. 否则 `create` 新会话并插入映射

### 3. 嵌入 URL
`{opencodeBase}/server/{base64(origin)}/session/{sessionId}`

### 4. 前端交互
- 项目卡片 → open-chat → iframe
- 「会话列表」toggle 左侧「我的会话」；默认进入项目后展开
- 「切换项目」回卡片页
- 删除当前会话后切下一会话；若无则自动新建

### 5. UI 裁切（仅平台）
- 顶栏约 36px 负偏移裁切
- 右侧文件变更区用宽度放大 + overflow 裁切近似隐藏（不调用 OpenCode API）

## API

```
POST   /projects/:id/open-chat
GET    /projects/:id/sessions
POST   /projects/:id/sessions
DELETE /projects/:id/sessions/:sessionId
```

## Risks / Trade-offs

- **[Risk] OpenCode 会话被远端删除后映射仍在** → Mitigation：打开失败时前端提示；后续可校验并清理
- **[Risk] 右侧面板裁切比例不准** → Mitigation：比例可调；仅为视觉裁切
- **[Trade-off] 软删不删远端** → 符合「不改 OpenCode / 可恢复」；列表仅看平台映射

## Open Questions

- 是否需要将远端已有、未映射的会话一键「认领」进本库列表？（当前仅 open-chat 首条 / 新建写入）
