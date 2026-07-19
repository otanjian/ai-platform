## ADDED Requirements

### Requirement: Platform stores shared projects with absolute paths
The system SHALL persist each project as a first-class MySQL entity with a unique absolute `project_path`, name, optional description, owner, status (`active` | `archived` | `deleted`), and timestamps. Data MUST be stored in the platform database, not in OpenCode.

#### Scenario: Create project with absolute path
- **WHEN** an authorized user creates a project with name and absolute path that exists as a directory
- **THEN** the system inserts a `project` row, sets the creator as owner, and returns the project

#### Scenario: Reject missing directory
- **WHEN** a user creates a project with a path that does not exist or is not a directory
- **THEN** the system rejects the request with a clear error and does not create the project

#### Scenario: Reject duplicate path
- **WHEN** a user creates a project whose `project_path` already belongs to another project
- **THEN** the system rejects the request due to uniqueness conflict

### Requirement: Projects support multi-user membership with Chinese role labels
The system SHALL allow multiple platform users to share one project via `project_member` with roles `owner`, `admin`, `member`, `viewer`. The UI MUST display roles in Chinese: 所有者, 管理员, 成员, 观察者.

#### Scenario: Add member
- **WHEN** an owner or admin adds a platform user to a project with role `member`
- **THEN** the system creates a `project_member` row and the member appears in the project member list

#### Scenario: Owner cannot be removed
- **WHEN** a user attempts to remove the project owner from members
- **THEN** the system rejects the removal

#### Scenario: List only accessible projects
- **WHEN** a non-super-admin user lists projects
- **THEN** the system returns only projects where the user is a member

### Requirement: Project CRUD and status lifecycle
The system SHALL allow authorized members to view and update project metadata, and allow owner/admin to archive or soft-delete a project. Soft-deleted projects MUST be excluded from the default list.

#### Scenario: Archive project
- **WHEN** an owner archives a project
- **THEN** the project status becomes `archived` and it no longer appears in the default active list

#### Scenario: Update project metadata
- **WHEN** an owner or admin updates name or description
- **THEN** the system persists the changes and returns the updated project

### Requirement: Migrate and remove legacy user_project
The system SHALL migrate existing `user_project` rows into `project` + `project_member` (role `owner`) and remove the `user_project` table afterward.

#### Scenario: Legacy row migration
- **WHEN** the migration runs on a database containing `user_project` rows
- **THEN** each row becomes a project owned by that user with a corresponding owner membership, and `user_project` is dropped

### Requirement: Project initialization UI for workspace management
The frontend Project Initialization page SHALL provide a project list, create wizard (name, path, optional template, members), and project detail with member management. AGENTS.md generation MUST NOT be required in this version.

#### Scenario: Create via wizard
- **WHEN** a user completes the create wizard with valid path and optional members
- **THEN** the project appears in the list and members are assigned

#### Scenario: Manage members in detail view
- **WHEN** an owner opens a project detail and adds or removes members (except owner)
- **THEN** the member list updates without page navigation away from the project workspace UI
