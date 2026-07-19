## ADDED Requirements

### Requirement: Users can view agent session file diffs
The system SHALL allow a user to view file diffs produced by their own mapped OpenCode session for an accessible project.

#### Scenario: Load session diffs
- **WHEN** a user selects a project and one of their active sessions on「变更 Diff」and the session has file changes
- **THEN** the system returns that session's file diffs (`file`, `patch`, `additions`, `deletions`, `status`) and the UI shows a file list plus a patch viewer

#### Scenario: Empty diffs
- **WHEN** the selected session has no file changes
- **THEN** the UI shows an empty state indicating no agent changes

#### Scenario: Cannot view others' sessions
- **WHEN** a user requests diff for a sessionId not mapped to them on that project
- **THEN** the system returns 404 and does not proxy OpenCode
