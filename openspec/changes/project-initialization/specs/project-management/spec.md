## ADDED Requirements

### Requirement: Project can be created with name, path, description, and template
The system SHALL allow a user to create a new project by providing a name, an absolute project path, an optional description, and an optional project template.

#### Scenario: Successful project creation
- **WHEN** an authenticated user submits a project creation request with a unique name and valid absolute path
- **THEN** the system creates a `project` record, sets the requester as the owner, and returns the project details

#### Scenario: Project path already exists
- **WHEN** a user submits a project creation request with a `project_path` that is already used by another project
- **THEN** the system rejects the request with a 409 error

#### Scenario: Project path is not writable
- **WHEN** a user submits a project creation request with a `project_path` that is not writable by the gateway process
- **THEN** the system rejects the request with a 400 error indicating the path is invalid

### Requirement: Project can be listed for the current user
The system SHALL return all projects where the current user is a member, including their role in each project.

#### Scenario: User has multiple projects
- **WHEN** an authenticated user requests their project list
- **THEN** the system returns all projects where the user is a member, sorted by most recently updated

#### Scenario: User has no projects
- **WHEN** an authenticated user requests their project list and has no memberships
- **THEN** the system returns an empty list

### Requirement: Project can be updated by owner or admin
The system SHALL allow project owners and admins to update the project name, description, and project path.

#### Scenario: Owner updates project
- **WHEN** the project owner submits an update to the project
- **THEN** the system persists the changes and returns the updated project

#### Scenario: Member attempts to update project
- **WHEN** a user with the member role attempts to update the project
- **THEN** the system rejects the request with a 403 error

### Requirement: Project can be archived or deleted by owner
The system SHALL allow project owners to change the project status to `archived` or `deleted`.

#### Scenario: Owner archives project
- **WHEN** the project owner requests to archive the project
- **THEN** the system sets the project status to `archived` and returns success

#### Scenario: Admin attempts to delete project
- **WHEN** a user with the admin role attempts to delete the project
- **THEN** the system rejects the request with a 403 error
