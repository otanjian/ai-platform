## ADDED Requirements

### Requirement: System provides built-in project templates
The system SHALL provide a set of built-in project templates: Web, API, Script, Mobile, and Custom.

#### Scenario: Seed data includes templates
- **WHEN** the database is seeded or the platform starts
- **THEN** the system ensures the built-in templates exist in the `project_template` table

#### Scenario: User requests template list
- **WHEN** an authenticated user requests the list of project templates
- **THEN** the system returns all active templates with their name, type, description, and default path

### Requirement: Template can be selected during project creation
The system SHALL allow users to select a template when creating a project. The selected template MAY influence the default project path and extra configuration.

#### Scenario: User creates project with Web template
- **WHEN** a user creates a project and selects the Web template
- **THEN** the system stores the template reference on the project and applies the template's default path if no path is provided

#### Scenario: User creates project without template
- **WHEN** a user creates a project without selecting a template
- **THEN** the system creates the project with a null template reference and no default path suggestions

### Requirement: Custom templates can be created by super admin
The system SHALL allow super admins to create custom project templates with a name, type, description, and optional extra configuration.

#### Scenario: Super admin creates custom template
- **WHEN** a super admin submits a custom template creation request
- **THEN** the system persists the template and returns it

#### Scenario: Non-admin attempts to create custom template
- **WHEN** a non-admin user attempts to create a custom template
- **THEN** the system rejects the request with a 403 error
