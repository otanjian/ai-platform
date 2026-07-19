## ADDED Requirements

### Requirement: Users can create and manage AI coding sessions
The system SHALL allow users to open AI coding sessions from assigned projects, list mapped sessions per user/project, continue a session via embed, and soft-delete mappings. Session IDs are persisted in platform table `opencode_session` (see change `add-opencode-session-binding`).

#### Scenario: Create a new coding session
- **WHEN** a user clicks「新建会话」in the project session sidebar (or open-chat finds none)
- **THEN** the system creates a new OpenCode session for the project directory, stores the mapping, and embeds the session UI

#### Scenario: List historical sessions
- **WHEN** a user opens「会话列表」for a project
- **THEN** the system displays that user's active mapped sessions for the project from `GET /projects/:id/sessions`

### Requirement: Users can chat with the AI agent to modify code
The system SHALL send user prompts to OpenCode and display agent responses, code changes, and diff information.

#### Scenario: Agent modifies code based on prompt
- **WHEN** a user types "Add a login API endpoint" and submits
- **THEN** the system sends the prompt to OpenCode via `/api/session/{id}/prompt` and streams back the agent's response and code changes

### Requirement: Users can access an embedded Web Terminal
The system SHALL embed the OpenCode Web PTY in an iframe within the Code Factory module.

#### Scenario: Open Web Terminal
- **WHEN** a user navigates to Code Factory → Web Terminal
- **THEN** the system opens a WebSocket connection to `/api/code/pty` and displays the terminal

### Requirement: Users can run code review on diffs or PRs
The system SHALL invoke OpenCode's `/review` command to review git diffs or pull requests.

#### Scenario: Review current branch diff
- **WHEN** a user selects "Review Current Diff" and clicks Run
- **THEN** the system calls `POST /session/{id}/command` with the review command and displays the AI review results

### Requirement: Users can configure MCP servers and LLM providers
The system SHALL provide UI to configure MCP servers and LLM provider credentials for OpenCode.

#### Scenario: Add an MCP server
- **WHEN** a user fills in the MCP server form and saves
- **THEN** the system persists the configuration and calls OpenCode `/mcp` API to register the server

### Requirement: Organization skills are managed and loaded into sessions
The system SHALL allow administrators to manage SKILL.md content and load it into agent sessions.

#### Scenario: Create an organization skill
- **WHEN** an admin creates a new skill in the skill library
- **THEN** the system stores the SKILL.md content in MySQL and makes it available when starting a new OpenCode session
