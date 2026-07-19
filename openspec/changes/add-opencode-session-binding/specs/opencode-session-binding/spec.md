## ADDED Requirements

### Requirement: Platform maps OpenCode sessions to user and project
The system SHALL persist a mapping from `(platform_user_id, project_id)` to OpenCode `session_id` in MySQL table `opencode_session`, and use it to open embeds and filter session lists.

#### Scenario: Open chat for an assigned project
- **WHEN** a project member calls `POST /projects/:id/open-chat`
- **THEN** the system returns `{ sessionId, embedUrl, created, title }` for an existing active mapping, or binds the earliest OpenCode session in the project directory, or creates a new OpenCode session and inserts a mapping

#### Scenario: Unauthorized user cannot open chat
- **WHEN** a non-member (and non-super-admin) calls `POST /projects/:id/open-chat`
- **THEN** the system rejects the request with 403

### Requirement: Users can list create and soft-delete their project sessions
The system SHALL expose session list/create/delete APIs scoped to the current user and project membership.

#### Scenario: List my sessions
- **WHEN** a member calls `GET /projects/:id/sessions`
- **THEN** the system returns active `opencode_session` rows for that user and project, each including `embedUrl`, ordered by `updated_at` descending

#### Scenario: Create a new session
- **WHEN** a member calls `POST /projects/:id/sessions`
- **THEN** the system creates an OpenCode session in the project directory, inserts an active mapping, and returns the new session payload

#### Scenario: Soft-delete a session
- **WHEN** a member calls `DELETE /projects/:id/sessions/:sessionId` for their own active mapping
- **THEN** the system sets `status=deleted` and the session no longer appears in the list; OpenCode source code is not modified

### Requirement: AI programming session UI embeds OpenCode by project
The Code Factory AI chat page SHALL show assigned project cards, embed the opened session, and provide an in-page session sidebar.

#### Scenario: Enter project and embed session
- **WHEN** the user clicks an assigned project card
- **THEN** the UI calls open-chat and embeds `embedUrl` in an iframe

#### Scenario: Session sidebar switch create delete
- **WHEN** the user opens「会话列表」
- **THEN** the UI shows「我的会话」with switch, create, and delete actions; deleting the active session switches to another remaining session or creates a new one if none remain

#### Scenario: Switch project
- **WHEN** the user clicks「切换项目」
- **THEN** the UI returns to the project card grid without requiring a full logout
