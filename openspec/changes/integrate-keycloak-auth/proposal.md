## Why

The current gateway uses a local username/password list stored in `config.yaml` and `data/users.json`. For a team of up to 10 developers this is acceptable, but it lacks enterprise-grade user management: password policies, role-based access control, audit logs, and centralized user lifecycle. Keycloak is an open-source identity and access management solution that can provide all of these features. Integrating Keycloak lets the gateway delegate authentication and group-based authorization to a dedicated system while keeping the OpenCode multi-user isolation unchanged.

## What Changes

- Add a local Keycloak service to the `aiplatform` repository (Docker Compose based on the official Keycloak image).
- Configure a Keycloak realm, an OpenID Connect client for the gateway, and groups that map to OpenCode projects.
- Replace the gateway's local authentication with an OIDC Authorization Code flow via Keycloak.
- Add a `group -> project` mapping in the gateway configuration so that Keycloak group membership determines which projects a user can open.
- Remove or deprecate the local username/password login flow in the gateway (kept as a fallback if explicitly enabled).
- Do not modify OpenCode itself; the per-user process isolation and project routing remain the same.

## Capabilities

### New Capabilities
- `keycloak-deployment`: Run Keycloak locally via Docker Compose with a pre-configured realm and client.
- `oidc-authentication`: Authenticate gateway users through Keycloak using the OIDC Authorization Code flow.
- `group-based-project-access`: Map Keycloak groups to OpenCode projects and restrict access based on group membership.

### Modified Capabilities
- No existing capability requirements change; this change replaces the authentication implementation while preserving the existing per-user/project isolation behavior.

## Impact

- Adds a `keycloak/` directory and a `docker-compose.yaml` to the repository.
- Changes the gateway login flow from local form-based login to a Keycloak login page.
- Removes the need for `config.yaml` to store plaintext or hashed passwords (Keycloak stores them).
- `data/users.json` is no longer needed for authentication; it may be removed or kept as a local-only fallback.
- Requires Docker to run Keycloak during local development.
- Existing OpenCode child-process isolation and XDG directory logic remain untouched.
