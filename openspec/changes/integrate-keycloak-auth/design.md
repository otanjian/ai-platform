## Context

The gateway currently authenticates users with a local username/password form and stores user-to-project mappings in `data/users.json`. This works for a small team but is hard to scale: password resets, group changes, and new-hire onboarding all require manual file edits. Keycloak is a mature open-source IAM server that can centralize authentication and group-based authorization. We want to plug Keycloak into the gateway without changing the OpenCode process isolation logic.

## Goals / Non-Goals

**Goals:**
- Run a local Keycloak instance for development via Docker Compose.
- Authenticate users through Keycloak OIDC Authorization Code flow.
- Map Keycloak groups to OpenCode projects.
- Preserve per-user OpenCode process isolation and XDG directory isolation.
- Provide a migration path from the existing local-auth users.

**Non-Goals:**
- Modifying OpenCode source code.
- Running Keycloak in production (the local Docker setup is for development only).
- Fine-grained roles (e.g., read-only vs. editor) inside OpenCode; only project-level access is controlled.
- Replacing the gateway itself; it remains the reverse proxy.

## Decisions

- **Use Keycloak's official Docker image** with `start-dev` mode for local use. It starts quickly and has an admin console on `localhost:8080`.
- **Realm per environment**: create a realm named `opencode` for the gateway.
- **OIDC client**: create a public client named `gateway` with `http://127.0.0.1:9090/auth/callback` as the redirect URI.
- **Group-based project mapping**: each Keycloak group represents a project. The gateway config maps a group name to a local directory path. Example: `project-a: /Users/team/project-a`.
- **Userinfo endpoint for groups**: request the `groups` claim by including the `groups` scope and a Keycloak client scope mapper that includes `groups` in the userinfo response.
- **Session storage**: keep the existing signed cookie session, storing only the user's Keycloak `sub`, `preferred_username`, and group list. Tokens are exchanged during login but not persisted in the cookie to keep it small and browser-compatible.
- **Project list page remains in the gateway**: after login, the gateway reads the user's groups, resolves them to project paths, and shows the project selection page.
- **Local auth fallback**: allow `local` authentication when Keycloak is disabled via config, so the gateway can still be tested without Docker.

## Risks / Trade-offs

- [Risk] Docker is required for local development. → Mitigation: keep a local-auth fallback for environments without Docker.
- [Risk] Keycloak startup is slow (10-20 seconds) and memory-heavy. → Mitigation: use `start-dev` and disable features not needed; document resource requirements.
- [Risk] Group names and project paths can drift. → Mitigation: centralize the mapping in `config.yaml` and validate on startup.
- [Risk] Keycloak session state is separate from the gateway cookie. → Mitigation: store the user's identity and groups in the signed cookie and validate it on every request.
- [Trade-off] Group-based mapping is coarser than per-user project lists. → Acceptable for this scale; can be extended later with Keycloak attributes or roles.

## Migration Plan

1. Add Docker Compose for Keycloak and start it.
2. Create the realm, client, groups, and initial users via a Keycloak import file or admin console.
3. Update `config.yaml` with Keycloak URL, client ID, and `group -> project` mapping.
4. Stop the gateway and restart it with the new configuration.
5. Existing `data/users.json` is no longer authoritative; archive it.
6. Rollback: disable Keycloak in `config.yaml` and re-enable local auth.

## Open Questions

- Should we pre-seed Keycloak with a realm import JSON file, or document manual steps?
- Should the gateway use PKCE for the OIDC flow? (Recommended for public clients.)
- Should we expose a `/auth/logout` endpoint that also logs the user out of Keycloak?
