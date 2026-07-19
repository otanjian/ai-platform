## ADDED Requirements

### Requirement: Users can log in with local credentials
The gateway SHALL authenticate users with a local username and password.

#### Scenario: Successful login
- **WHEN** a user submits valid username and password on the login page
- **THEN** the gateway creates a session cookie
- **AND** the user is redirected to the project list

#### Scenario: Failed login
- **WHEN** a user submits an invalid username or password
- **THEN** the gateway returns a 401 response
- **AND** no session cookie is created

### Requirement: Sessions are maintained across requests
The gateway SHALL identify authenticated users via a session cookie for all subsequent requests.

#### Scenario: Accessing a protected route
- **WHEN** an authenticated user requests the project list
- **THEN** the gateway reads the session cookie
- **AND** returns the projects associated with that user

#### Scenario: Accessing a protected route without a session
- **WHEN** a request without a valid session cookie accesses a protected route
- **THEN** the gateway redirects the request to the login page

### Requirement: Users can log out
The gateway SHALL allow users to terminate their session.

#### Scenario: Logout
- **WHEN** an authenticated user clicks logout
- **THEN** the gateway invalidates the session cookie
- **AND** the user is redirected to the login page
