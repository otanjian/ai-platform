## ADDED Requirements

### Requirement: Administrators can manage users
The system SHALL provide a user management interface backed by Keycloak, including listing, searching, and basic user operations.

#### Scenario: List platform users
- **WHEN** an admin navigates to System Settings → User Management
- **THEN** the system loads users from Keycloak Admin API and displays them in a table

### Requirement: Administrators can manage platform roles and menu permissions
The system SHALL allow mapping Keycloak roles to platform roles and configuring menu-level permissions.

#### Scenario: Configure developer role permissions
- **WHEN** an admin edits the developer role
- **THEN** the system updates the `platform_role` and `role_menu_permission` tables to reflect allowed menus

### Requirement: Administrators can configure subsystem connections
The system SHALL provide forms to configure OpenCode, DataEase, and BuildingAI URLs and credentials.

#### Scenario: Configure DataEase connection
- **WHEN** an admin fills in the DataEase base URL, OIDC client, and admin credentials
- **THEN** the system saves the configuration in `subsystem_config` and tests connectivity

### Requirement: Administrators can manage API keys
The system SHALL allow generating and revoking API keys for external access to the platform.

#### Scenario: Generate API key
- **WHEN** an admin creates an API key with scopes for Smart Pipeline
- **THEN** the system stores the hashed key in `platform_api_key` and displays it once

### Requirement: Administrators can configure notification channels
The system SHALL support email, webhook, WeCom, DingTalk, and Lark notification channels.

#### Scenario: Add email SMTP channel
- **WHEN** an admin configures SMTP server, port, username, and password
- **THEN** the system saves the configuration in `notification_channel` and sends a test email

### Requirement: Administrators can view operation logs
The system SHALL provide a searchable and exportable audit log interface.

#### Scenario: Search audit logs by user
- **WHEN** an admin enters a username in the audit log search
- **THEN** the system filters the `audit_log` table and displays matching records

### Requirement: Administrators can manage system settings
The system SHALL allow configuring platform-level settings such as brand name, default language, and feature flags.

#### Scenario: Update platform name
- **WHEN** an admin changes the platform name in System Settings
- **THEN** the system updates the `system_setting` table and reflects the change in the UI
