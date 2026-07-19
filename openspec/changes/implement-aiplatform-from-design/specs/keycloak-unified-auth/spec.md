## ADDED Requirements

### Requirement: Users authenticate through Keycloak
The system SHALL use Keycloak as the unified identity provider for all platform users.

#### Scenario: Successful login
- **WHEN** a user clicks the login button on the platform
- **THEN** the system redirects to Keycloak, authenticates the user, and returns a platform JWT containing user identity and roles

### Requirement: Platform roles map to Keycloak realm roles
The system SHALL define four platform roles (super_admin, developer, data_analyst, business_user) and map them to corresponding Keycloak realm roles.

#### Scenario: User receives correct platform role
- **WHEN** a user logs in and Keycloak returns a realm role named "aiplatform-developer"
- **THEN** the system assigns the user the developer platform role and applies the corresponding menu permissions

### Requirement: SSO bridge authenticates to DataEase
The system SHALL use the BFF as an OIDC proxy terminal to exchange Keycloak identity for a DataEase X-DE-TOKEN.

#### Scenario: Developer accesses Data Insights
- **WHEN** a user with appropriate role navigates to Data Insights
- **THEN** the BFF obtains a DataEase X-DE-TOKEN via `POST /de2api/login/platformLogin/2` and injects it into subsequent DataEase API requests

### Requirement: SSO bridge authenticates to BuildingAI
The system SHALL create or find a BuildingAI user based on Keycloak identity and obtain a BuildingAI JWT for API access.

#### Scenario: User accesses AI Brain
- **WHEN** a user navigates to AI Brain
- **THEN** the BFF JIT-provisions a BuildingAI user mapped to the Keycloak user and obtains a BuildingAI JWT for proxy requests

### Requirement: Session is secure and supports logout
The system SHALL use PKCE for OIDC flow, store session securely, and support single logout.

#### Scenario: User logs out
- **WHEN** a user clicks logout
- **THEN** the system clears the platform session, invalidates Keycloak tokens, and redirects to the login page
