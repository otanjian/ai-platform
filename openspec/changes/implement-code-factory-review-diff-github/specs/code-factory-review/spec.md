## ADDED Requirements

### Requirement: Users can run AI code review on a project
The system SHALL let an authorized project member start an OpenCode `review` command for a project workspace and display the assistant review result in the Code Factory review page.

#### Scenario: Review current uncommitted diff
- **WHEN** a user selects a project (and optional session) and clicks「开始审查」with empty arguments
- **THEN** the platform ensures a mapped session for that user/project, calls OpenCode `POST /session/{id}/command` with `command=review`, and shows the returned review text

#### Scenario: No diff to review
- **WHEN** the project's working-tree VCS diff is empty before starting review
- **THEN** the system does not invoke the review command and shows「没有可审查的 diff」

#### Scenario: Unauthorized project
- **WHEN** a user without project access calls the review API
- **THEN** the system returns 403/404 consistent with other project APIs and does not call OpenCode

### Requirement: Review results expose risk labels
The system SHALL surface risk-level labels derived from the review text when present (e.g. critical/high/medium/low), while always showing the full review body.

#### Scenario: Text contains risk keywords
- **WHEN** the review body mentions high/medium/low (or Chinese 高/中/低风险)
- **THEN** the UI shows corresponding risk chips above the body
