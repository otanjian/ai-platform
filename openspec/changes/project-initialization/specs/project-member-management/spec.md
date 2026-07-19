## ADDED Requirements

### Requirement: Project owner can add members
The system SHALL allow a project owner to add platform users as project members with a role of admin, member, or viewer.

#### Scenario: Owner adds a member
- **WHEN** the project owner adds a user with the member role to the project
- **THEN** the system creates a `project_member` record and returns the new member

#### Scenario: Owner adds an existing member
- **WHEN** the project owner attempts to add a user who is already a project member
- **THEN** the system rejects the request with a 409 error

### Requirement: Project owner can remove members
The system SHALL allow a project owner to remove any member except themselves.

#### Scenario: Owner removes a member
- **WHEN** the project owner removes a user with the viewer role from the project
- **THEN** the system deletes the corresponding `project_member` record

#### Scenario: Owner attempts to remove themselves
- **WHEN** the project owner attempts to remove themselves from the project
- **THEN** the system rejects the request with a 400 error

### Requirement: Project owner can change member roles
The system SHALL allow a project owner to change the role of any project member. Admins SHALL be allowed to change roles of members and viewers, but not owners or other admins.

#### Scenario: Owner promotes a member to admin
- **WHEN** the project owner changes a member's role to admin
- **THEN** the system updates the `project_member` record and returns the updated role

#### Scenario: Admin attempts to change owner role
- **WHEN** an admin attempts to change the owner's role
- **THEN** the system rejects the request with a 403 error

### Requirement: Project members can view project based on their role
The system SHALL allow all project members (owner, admin, member, viewer) to view the project details. Only members with owner or admin roles SHALL be allowed to manage project settings.

#### Scenario: Viewer views project details
- **WHEN** a user with the viewer role requests the project details
- **THEN** the system returns the project information and the user's role

#### Scenario: Viewer attempts to manage members
- **WHEN** a user with the viewer role attempts to add a member
- **THEN** the system rejects the request with a 403 error
