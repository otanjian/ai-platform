## ADDED Requirements

### Requirement: Gateway initiates OIDC login with Keycloak
The gateway SHALL redirect unauthenticated users to Keycloak for login and complete the OIDC Authorization Code flow.

#### Scenario: Unauthenticated user visits the gateway
- **WHEN** a user without a valid session accesses `/login` or a protected page
- **THEN** the gateway redirects them to the Keycloak authorization endpoint
- **AND** the request includes the correct `client_id`, `redirect_uri`, `response_type=code`, and PKCE parameters

### Requirement: Gateway exchanges the authorization code for tokens
After the user authenticates in Keycloak, the gateway SHALL exchange the authorization code for access and ID tokens and use them to obtain the user's identity and groups.

#### Scenario: User returns from Keycloak with a code
- **WHEN** Keycloak redirects the user to `/auth/callback?code=...&state=...`
- **THEN** the gateway validates the state and code verifier
- **AND** the gateway fetches tokens from Keycloak's token endpoint
- **AND** the gateway fetches the userinfo response to obtain the user's groups
- **AND** the gateway creates a signed session cookie containing the user's identity and groups

### Requirement: Gateway validates the session on every request
The gateway SHALL verify that the signed session cookie is present and untampered on every request to a protected page.

#### Scenario: Authenticated user makes a request
- **WHEN** a user with a valid session cookie requests a protected page
- **THEN** the gateway validates the cookie signature and payload
- **AND** the request proceeds if the cookie is valid

### Requirement: Gateway provides a logout endpoint
The gateway SHALL provide a logout endpoint that clears the gateway session cookie.

#### Scenario: User clicks logout
- **WHEN** a user visits `/logout`
- **THEN** the gateway clears the session cookie
- **AND** the gateway redirects to the login page
