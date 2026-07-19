## ADDED Requirements

### Requirement: Gateway proxies all three subsystems
The system SHALL expose unified routes for OpenCode, DataEase, and BuildingAI under `/api/code/*`, `/api/bi/*`, and `/api/agent/*` respectively.

#### Scenario: Proxy routes to correct subsystem
- **WHEN** the frontend sends a request to `/api/code/api/session`
- **THEN** the gateway forwards it to OpenCode at `:4096/api/session`

### Requirement: Gateway injects subsystem authentication tokens
The system SHALL inject the correct authentication token for DataEase and BuildingAI requests based on the current user.

#### Scenario: DataEase request includes X-DE-TOKEN
- **WHEN** the frontend sends a request to `/api/bi/de2api/dataset/tree`
- **THEN** the gateway injects the cached X-DE-TOKEN for the current user before forwarding to DataEase

### Requirement: Gateway records audit logs
The system SHALL record every API call to the MySQL `audit_log` table with user, subsystem, path, method, status, and timestamp.

#### Scenario: User action is audited
- **WHEN** a user makes any API request through the gateway
- **THEN** the system writes an audit log entry within 1 second

### Requirement: Gateway aggregates health and statistics
The system SHALL expose `/api/gateway/health` and `/api/gateway/stats` to aggregate the status of OpenCode, DataEase, and BuildingAI.

#### Scenario: Health endpoint returns subsystem status
- **WHEN** the frontend requests `/api/gateway/health`
- **THEN** the gateway returns the online/offline status of OpenCode, DataEase, and BuildingAI based on periodic probes

### Requirement: Gateway enforces platform-level access control
The system SHALL reject requests to modules that the user's platform role is not permitted to access.

#### Scenario: Unauthorized access is blocked
- **WHEN** a business_user attempts to access `/api/code/*`
- **THEN** the gateway returns HTTP 403 with an error message indicating insufficient permissions
