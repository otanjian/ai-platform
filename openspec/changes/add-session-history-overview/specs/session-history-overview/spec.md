## ADDED Requirements

### Requirement: Users can list their sessions across projects
The system SHALL expose `GET /sessions` that returns the current user's active `opencode_session` mappings across all projects, each including `projectId`, `projectName`, `sessionId`, `title`, timestamps, and `embedUrl`, ordered by `updated_at` descending.

#### Scenario: List my session history
- **WHEN** an authenticated user calls `GET /sessions`
- **THEN** the system returns only that user's rows with `status=active`, joined with project name

#### Scenario: Unauthenticated request rejected
- **WHEN** an unauthenticated caller requests `GET /sessions`
- **THEN** the system responds with 401

### Requirement: Session history page supports filter search open and soft-delete
The Code Factory「会话列表」page SHALL show a cross-project history overview with project filter, text search, open, and soft-delete actions.

#### Scenario: Filter by project
- **WHEN** the user selects a project in the filter panel
- **THEN** the list shows only that project's sessions for the current user

#### Scenario: Search by title or session id
- **WHEN** the user types a search query
- **THEN** the list filters sessions whose title or sessionId contains the query (case-insensitive)

#### Scenario: Open session from history
- **WHEN** the user clicks「打开」on a session row
- **THEN** the UI navigates to `/code-factory/chat?projectId={id}&sessionId={sessionId}` and the chat page embeds that session

#### Scenario: Soft-delete from history
- **WHEN** the user confirms delete on a history row
- **THEN** the UI calls `DELETE /projects/:id/sessions/:sessionId` and the row disappears from the overview without deleting OpenCode remote data

### Requirement: Chat page accepts deep-link to a mapped session
The AI programming chat page SHALL accept `projectId` and optional `sessionId` query parameters to open an assigned project session without requiring the user to click the project card first.

#### Scenario: Deep-link with project and session
- **WHEN** the user opens `/code-factory/chat?projectId={id}&sessionId={sid}` and the mapping is active and accessible
- **THEN** the page enters the embed view for that project and session

#### Scenario: Deep-link session missing
- **WHEN** the session mapping is missing or not accessible
- **THEN** the page shows an error and falls back to the project card grid or opens via `open-chat` for that project when only project access remains
