## ADDED Requirements

### Requirement: Gateway reads user groups from Keycloak
The gateway SHALL obtain the user's group memberships from the ID token or userinfo response.

#### Scenario: User logs in via Keycloak
- **WHEN** a user completes OIDC login
- **THEN** the gateway extracts the `groups` claim from the token or userinfo
- **AND** the gateway stores the group list in the session

### Requirement: Groups map to OpenCode projects
The gateway SHALL use a configured mapping from Keycloak group names to local project directories.

#### Scenario: Configured group mapping
- **GIVEN** the gateway config contains `groups: { project-a: "/path/a" }`
- **WHEN** a user is a member of the Keycloak group `project-a`
- **THEN** the user's allowed project list includes `/path/a`

### Requirement: Users can only open projects from their groups
The gateway SHALL enforce that a user can only open projects whose corresponding group they belong to.

#### Scenario: Opening an allowed project
- **WHEN** a user in the `project-a` group requests `/open-project?project=/path/a`
- **THEN** the gateway starts an OpenCode process for that project

#### Scenario: Opening a forbidden project
- **WHEN** a user not in the `project-a` group requests `/open-project?project=/path/a`
- **THEN** the gateway returns a 403 response
- **AND** no OpenCode process is started
