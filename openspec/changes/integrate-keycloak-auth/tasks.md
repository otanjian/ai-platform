## 1. Keycloak Infrastructure

- [x] 1.1 Add `keycloak/docker-compose.yaml` using the official Keycloak image in dev mode
- [x] 1.2 Add a `keycloak/realm-import.json` to pre-create the `opencode` realm, `gateway` client, and project groups
- [x] 1.3 Add `keycloak/README.md` with startup and admin-console instructions
- [x] 1.4 Start Keycloak and verify the realm is available

## 2. Gateway OIDC Configuration

- [x] 2.1 Extend `config.yaml` with `oidc` section (issuer, clientId, redirectUri, scopes, group mapping)
- [x] 2.2 Update `GatewayConfig` type and `loadConfig` to validate OIDC settings
- [x] 2.3 Implement OIDC using plain `fetch` (no extra dependency needed)
- [x] 2.4 Keep local-auth as a fallback when OIDC is not configured

## 3. OIDC Authentication in Gateway

- [x] 3.1 Create `src/oidc.ts` to handle discovery, authorization URL generation, and PKCE
- [x] 3.2 Add `/auth/login` route that redirects to Keycloak
- [x] 3.3 Add `/auth/callback` route to exchange code for tokens and create session cookie
- [x] 3.4 Validate the signed session cookie on every request
- [x] 3.5 Add `/logout` route that clears the gateway session cookie

## 4. Group-Based Project Access

- [x] 4.1 Extract `groups` claim from the ID token or userinfo response
- [x] 4.2 Map Keycloak groups to project paths using the gateway config
- [x] 4.3 Update `/projects` to show only projects allowed by the user's groups
- [x] 4.4 Update `/open-project` to enforce group-based project permissions

## 5. Refactor Existing Auth

- [x] 5.1 Remove the local form-based login page when OIDC is enabled
- [x] 5.2 Keep the local login page and `UserStore` available as a fallback
- [x] 5.3 Update `templates.ts` to conditionally render login options
- [x] 5.4 Update `README.md` with both OIDC and local-auth instructions

## 6. Testing and Verification

- [x] 6.1 Add unit tests for group-to-project mapping
- [x] 6.2 Add unit tests for OIDC token parsing and validation
- [x] 6.3 Verify that Keycloak users can log in and see their projects
- [x] 6.4 Verify that users without the correct group cannot access a project
- [x] 6.5 Verify that local-auth fallback still works when OIDC is disabled
