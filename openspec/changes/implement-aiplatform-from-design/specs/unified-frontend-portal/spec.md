## ADDED Requirements

### Requirement: User sees a unified dashboard after login
The system SHALL display a unified dashboard with key metrics, module shortcuts, activity timeline, service health status, and a global command palette.

#### Scenario: Dashboard loads successfully
- **WHEN** an authenticated user navigates to the platform root
- **THEN** the system displays the dashboard with 4 key metric cards, 3 module shortcut cards, a recent activity timeline, service health indicators, and a global search command palette

### Requirement: Frontend supports all six top-level modules
The system SHALL provide navigation and pages for all six modules: Dashboard, Code Factory, Data Insights, AI Brain, Smart Pipeline, and System Settings.

#### Scenario: User navigates through modules
- **WHEN** an authenticated user clicks a module in the sidebar
- **THEN** the system navigates to the corresponding module page and displays the module's sub-menu and content

### Requirement: Frontend enforces role-based menu access
The system SHALL hide or disable menu items based on the user's platform role.

#### Scenario: Business user cannot access Code Factory
- **WHEN** a user with the business_user role logs in
- **THEN** the system hides the Code Factory menu and shows only Data Insights, AI Brain, Smart Pipeline, and read-only modules according to the role matrix

### Requirement: Frontend is responsive across breakpoints
The system SHALL adapt layout for desktop (≥1440px), tablet (1024-1440px), and mobile (<1024px) breakpoints.

#### Scenario: User opens platform on tablet
- **WHEN** a user views the platform on a 1200px-wide screen
- **THEN** the system collapses the sidebar and shows a two-column layout with main content and optional auxiliary panel

### Requirement: Frontend supports iframe embedding of subsystems
The system SHALL embed OpenCode web terminal, DataEase dashboards, and BuildingAI agent chat via iframe with proper cross-origin handling.

#### Scenario: User opens OpenCode web terminal
- **WHEN** a user navigates to Code Factory → Web Terminal
- **THEN** the system loads the OpenCode terminal in an iframe at `/api/code/*` with a full-screen toggle
