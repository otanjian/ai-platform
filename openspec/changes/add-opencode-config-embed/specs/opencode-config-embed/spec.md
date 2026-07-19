## ADDED Requirements

### Requirement: Code Factory exposes OpenCode config embed entry
The system SHALL provide a Code Factory menu item「配置管理」that opens an embedded OpenCode Web root page.

#### Scenario: Open config management
- **WHEN** a permitted user navigates to `/code-factory/config`
- **THEN** the main content area shows a full-size iframe whose `src` is `http://127.0.0.1:4096/`

#### Scenario: Title in top bar without page description
- **WHEN** the user is on `/code-factory/config`
- **THEN** the top bar shows the title「配置管理」between the sidebar toggle and the service status, and the page content SHALL NOT show an in-page heading or the description「嵌入 OpenCode 配置与工作台。」

#### Scenario: OpenCode chrome titlebar is hidden
- **WHEN** the config embed is displayed
- **THEN** the OpenCode top chrome (DEV badge / workspace switcher / new-tab controls) SHALL NOT be visible in the host viewport (achieved by host-side iframe crop, without modifying OpenCode source)
