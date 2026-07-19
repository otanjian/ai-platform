## ADDED Requirements

### Requirement: Each user has a configurable list of permitted projects
The gateway SHALL maintain a mapping from users to the set of project directories they are allowed to access.

#### Scenario: Listing permitted projects
- **WHEN** an authenticated user views the project list
- **THEN** the gateway returns only the projects configured for that user

### Requirement: Users cannot access projects not assigned to them
The gateway SHALL reject any attempt to open a project that is not in the user's permitted list.

#### Scenario: Opening an assigned project
- **WHEN** an authenticated user requests to open a project in their list
- **THEN** the gateway starts or routes to the user's OpenCode instance for that project

#### Scenario: Opening an unassigned project
- **WHEN** an authenticated user requests to open a project not in their list
- **THEN** the gateway returns a 403 response
- **AND** no OpenCode instance is started for that project

### Requirement: Project paths are validated before use
The gateway SHALL verify that a project path exists on disk and is a directory before launching OpenCode.

#### Scenario: Valid project path
- **WHEN** the gateway opens a configured project whose path exists and is a directory
- **THEN** the gateway launches OpenCode with that directory as the working directory

#### Scenario: Invalid project path
- **WHEN** the gateway opens a configured project whose path does not exist or is not a directory
- **THEN** the gateway returns a 400 response
- **AND** the user sees an error message
