## ADDED Requirements

### Requirement: The gateway proxies HTTP requests to the correct user OpenCode process
The gateway SHALL forward all HTTP requests from authenticated users to their assigned OpenCode child process.

#### Scenario: Static assets
- **WHEN** an authenticated user requests an OpenCode static asset (e.g., `index.html`)
- **THEN** the gateway forwards the request to the user's OpenCode process
- **AND** returns the response to the user

#### Scenario: API request
- **WHEN** an authenticated user makes an OpenCode API request
- **THEN** the gateway forwards the request to the user's OpenCode process
- **AND** returns the response to the user

### Requirement: The gateway proxies WebSocket connections to the correct user OpenCode process
The gateway SHALL handle `Upgrade: websocket` requests and forward them to the user's OpenCode process.

#### Scenario: WebSocket upgrade
- **WHEN** an authenticated user opens a WebSocket connection through the gateway
- **THEN** the gateway forwards the upgrade request to the user's OpenCode process
- **AND** maintains a bidirectional relay between the browser and OpenCode

#### Scenario: WebSocket disconnect
- **WHEN** either the browser or the OpenCode process closes the WebSocket
- **THEN** the gateway closes the corresponding relay connection

### Requirement: The gateway hides the child process ports from users
The gateway SHALL ensure users never interact directly with the dynamic ports assigned to OpenCode child processes.

#### Scenario: Requesting through the gateway
- **WHEN** a user accesses OpenCode via the gateway URL
- **THEN** all requests appear to come from the gateway's public port
- **AND** the child process port is not exposed in URLs or cookies

### Requirement: The gateway rejects requests for users without an active process
The gateway SHALL return an error if a request arrives for a user whose OpenCode process cannot be started.

#### Scenario: Process fails to start
- **WHEN** the gateway attempts to start a user's OpenCode process but it fails
- **THEN** the gateway returns a 503 response
- **AND** logs the failure reason
