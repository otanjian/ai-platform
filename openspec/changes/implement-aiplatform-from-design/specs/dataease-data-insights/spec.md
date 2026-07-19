## ADDED Requirements

### Requirement: Users can browse and manage dashboards
The system SHALL display a grid of DataEase dashboards and allow opening, editing, and deleting dashboards based on permissions.

#### Scenario: View dashboard list
- **WHEN** a user navigates to Data Insights → Dashboard Center
- **THEN** the system loads dashboards from DataEase `/de2api/panel` and displays them as cards

### Requirement: Users can manage charts and datasets
The system SHALL provide access to DataEase chart library and dataset management.

#### Scenario: Edit a dataset
- **WHEN** a user clicks a dataset in Data Insights → Datasets
- **THEN** the system opens the dataset editor using DataEase `/de2api/dataset` API

### Requirement: Users can connect and manage data sources
The system SHALL display connected data sources and allow adding/editing database, file, or API connections.

#### Scenario: Add a MySQL data source
- **WHEN** a user fills in the data source connection form and clicks Test
- **THEN** the system calls DataEase `/de2api/datasource` to verify and save the connection

### Requirement: Users can ask natural language questions about data
The system SHALL provide a natural language interface that generates queries and charts, powered by an LLM and DataEase query API.

#### Scenario: Ask for monthly sales trend
- **WHEN** a user types "Show me last month's sales trend by region" in the NL2Chart interface
- **THEN** the system generates a DataEase query and renders a trend chart

### Requirement: Users can configure data permissions
The system SHALL expose DataEase row-level, column-level, and resource-level permission configuration.

#### Scenario: Configure row permissions
- **WHEN** an admin selects a dataset and configures a row permission rule
- **THEN** the system saves the rule via DataEase `/de2api/rowPermissions`

### Requirement: Users can embed dashboards externally
The system SHALL generate embedded dashboard links and tokens for third-party pages.

#### Scenario: Generate embed code
- **WHEN** a user selects a dashboard and clicks Embed
- **THEN** the system calls DataEase Embedded API to obtain an `X-EMBEDDED-TOKEN` and provides an embed snippet
