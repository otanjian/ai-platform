## ADDED Requirements

### Requirement: Users can generate an OpenCode GitHub Action workflow
The system SHALL provide a GitHub automation wizard that generates an OpenCode GitHub Action workflow YAML based on selected triggers, without calling OpenCode HTTP APIs for installation.

#### Scenario: Generate default workflow
- **WHEN** a user opens「GitHub 自动化」and accepts default triggers
- **THEN** the system shows a downloadable/copyable workflow YAML suitable for `.github/workflows/opencode.yml`

#### Scenario: Change triggers updates YAML
- **WHEN** a user toggles trigger options (e.g. issue comments, pull requests)
- **THEN** the previewed YAML updates to include those trigger events

### Requirement: Wizard documents manual install steps
The system SHALL display clear steps for committing the workflow and configuring repository secrets/permissions required by OpenCode GitHub integration.

#### Scenario: View install steps
- **WHEN** a user opens the GitHub automation page
- **THEN** the UI lists the manual install steps (add workflow file, configure secrets, grant permissions)
