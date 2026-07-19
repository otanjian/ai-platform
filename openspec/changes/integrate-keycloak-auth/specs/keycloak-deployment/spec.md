## ADDED Requirements

### Requirement: Keycloak can be started from the repository
The repository SHALL provide a Docker Compose configuration that starts a local Keycloak instance suitable for development.

#### Scenario: Starting Keycloak
- **WHEN** a developer runs `docker compose up -d` in the `keycloak/` directory
- **THEN** Keycloak becomes available on `http://localhost:8080`
- **AND** the admin console is reachable with credentials configured in the compose file

### Requirement: Keycloak is pre-configured for the gateway
The Keycloak instance SHALL contain a realm named `opencode` with an OIDC client for the gateway and groups matching the project mapping.

#### Scenario: Fresh Keycloak container has the required realm
- **WHEN** Keycloak finishes starting
- **THEN** a realm named `opencode` exists
- **AND** the realm contains an OIDC client named `gateway`
- **AND** the realm contains groups for each configured project
- **AND** at least one admin user exists in the realm
