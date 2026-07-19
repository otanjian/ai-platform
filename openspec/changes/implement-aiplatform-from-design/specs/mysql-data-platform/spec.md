## ADDED Requirements

### Requirement: Platform uses MySQL 8.0 as the primary database
The system SHALL use MySQL 8.0 with utf8mb4 character set to persist platform-level data.

#### Scenario: MySQL service is available
- **WHEN** the platform starts
- **THEN** the gateway connects to MySQL using the configured `DATABASE_URL` and initializes all required tables

### Requirement: All required tables are created on startup
The system SHALL create 16 tables including `platform_user`, `platform_role`, `user_system_token`, `audit_log`, `pipeline_definition`, `subsystem_config`, `platform_api_key`, `notification_channel`, `organization_skill`, `system_setting`, `user_preference`, `notification_record`, and `user_project`.

#### Scenario: Fresh deployment
- **WHEN** the platform is deployed to a fresh environment
- **THEN** the migration scripts create all 16 tables with correct indexes and foreign keys

### Requirement: Subsystem tokens are cached in Redis and persisted in MySQL
The system SHALL cache active DataEase and BuildingAI tokens in Redis and persist them in MySQL for recovery.

#### Scenario: Token is cached and recoverable
- **WHEN** a user logs in and the BFF obtains subsystem tokens
- **THEN** the tokens are stored in Redis with TTL and written to `user_system_token` in MySQL

### Requirement: Audit logs are written to MySQL
The system SHALL write every gateway API call to the `audit_log` table.

#### Scenario: API call is audited
- **WHEN** any request passes through the gateway
- **THEN** an `audit_log` row is inserted with user, subsystem, path, method, status code, and timestamp

### Requirement: Pipeline definitions and executions are persistent
The system SHALL store pipeline definitions, execution records, and step details in MySQL.

#### Scenario: Pipeline execution is recorded
- **WHEN** a pipeline runs
- **THEN** the system creates rows in `pipeline_execution` and `pipeline_execution_step` with status, inputs, outputs, and logs

### Requirement: Subsystem configurations are stored in MySQL
The system SHALL store OpenCode, DataEase, and BuildingAI connection parameters in `subsystem_config`.

#### Scenario: Admin updates DataEase URL
- **WHEN** an admin updates the DataEase base URL in System Settings
- **THEN** the system updates the `subsystem_config` row and the gateway uses the new URL immediately

### Requirement: API keys are stored securely
The system SHALL store only the hash of API keys in MySQL, never the plain text.

#### Scenario: API key is generated
- **WHEN** an admin generates an API key
- **THEN** the system displays the plain key once and stores `api_key_hash` in `platform_api_key`
