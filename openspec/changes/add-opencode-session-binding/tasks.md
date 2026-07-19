## 1. Database

- [x] 1.1 Add `opencodeSession` to `gateway/src/db/schema.ts`
- [x] 1.2 Add migration `005_opencode_session.sql` and register in migrate runner

## 2. Gateway

- [x] 2.1 Implement OpenCode client helpers: list/create session, build embed URL
- [x] 2.2 Implement `POST /projects/:id/open-chat`
- [x] 2.3 Implement `GET/POST /projects/:id/sessions` and `DELETE /projects/:id/sessions/:sessionId` (soft delete)

## 3. Frontend

- [x] 3.1 Project cards on AI 编程会话 page for assigned active projects
- [x] 3.2 Embed OpenCode session iframe after open-chat; crop top titlebar
- [x] 3.3 Session sidebar: list / switch / create / soft-delete; keep open on switch;「切换项目」
- [x] 3.4 Optional right review-pane hide via platform-side iframe crop (no OpenCode code changes)

## 4. Documentation

- [x] 4.1 Sync `方案思路.md` (AI 编程会话、会话列表、能力矩阵、DDL、`opencode_session`)
- [x] 4.2 Record this change under `openspec/changes/add-opencode-session-binding/`
- [x] 4.3 Note follow-up pointer in `add-project-workspace-management/design.md` Non-Goals
