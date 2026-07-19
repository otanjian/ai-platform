## ADDED Requirements

### Requirement: OpenSpec is initialized in the project
The project MUST contain a valid OpenSpec configuration at the repository root.

#### Scenario: Fresh clone contains OpenSpec structure
- **WHEN** a developer clones the repository
- **THEN** the repository contains `openspec/config.yaml`
- **AND** the repository contains `.cursor/` skills and commands for OpenSpec

### Requirement: Every change follows the spec-driven workflow
Every non-trivial change MUST be tracked as an OpenSpec change with the required artifacts.

#### Scenario: Starting a new feature
- **WHEN** a developer starts a new feature
- **THEN** they create an OpenSpec change under `openspec/changes/<name>/`
- **AND** the change contains `proposal.md`, `design.md`, `specs/**/*.md`, and `tasks.md` before implementation begins

### Requirement: Cursor IDE integration is enabled
The project MUST be configured so that Cursor can use OpenSpec slash commands and skills.

#### Scenario: Using Cursor commands
- **WHEN** a developer opens the project in Cursor
- **THEN** OpenSpec slash commands are available in the chat
- **AND** OpenSpec skills are loaded by the agent
