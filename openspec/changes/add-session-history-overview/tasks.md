## 1. Gateway API

- [x] 1.1 Add pure helpers for session overview filtering/grouping + unit tests (RED then GREEN)
- [x] 1.2 Implement `GET /sessions` joining `opencode_session` + `project` for current user
- [x] 1.3 Verify unauthorized returns 401; response shape matches design

## 2. Frontend SessionListPage

- [x] 2.1 Replace placeholder with overview UI (project filter, search, table, empty/loading/error)
- [x] 2.2 Wire load via `GET /sessions`, soft-delete via existing DELETE, open via navigate deep-link
- [x] 2.3 Add empty-state links to AI 编程会话 / 项目初始化

## 3. Chat deep-link

- [x] 3.1 Parse `projectId` / `sessionId` from URL on ChatPage
- [x] 3.2 Auto-open mapped session when deep-link valid; handle missing mapping gracefully

## 4. Docs sync

- [x] 4.1 Update `方案思路.md` 会话列表/历史（定位 A、API、页面组件、与侧栏分工）
- [x] 4.2 Update capability matrix / TOC bullet for 会话列表 if present
- [x] 4.3 Mark OpenSpec tasks complete after verification
