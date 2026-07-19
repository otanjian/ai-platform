## 1. Infrastructure & Data Layer

- [x] 1.1 Add MySQL 8.0 and Redis 7 services to the Docker Compose deployment
- [x] 1.2 Create MySQL migration scripts for all 16 platform tables
- [x] 1.3 Integrate Drizzle ORM into the gateway and configure MySQL connection
- [x] 1.4 Implement Redis connection utilities and token caching helpers
- [x] 1.5 Create database seed data for platform roles, system settings, and initial subsystem configs

## 2. Keycloak Unified Authentication

- [x] 2.1 Create the `aiplatform` Keycloak realm configuration with roles and groups
- [x] 2.2 Define platform roles (super_admin, developer, data_analyst, business_user) and map to realm roles
- [x] 2.3 Implement Keycloak OIDC login/logout flow in the gateway
- [x] 2.4 Implement `platform_user` and `platform_role` synchronization from Keycloak
- [x] 2.5 Implement role-based menu permission enforcement

## 3. Tri-System BFF Gateway

- [x] 3.1 Refactor the existing gateway into a tri-system routing structure (`/api/code`, `/api/bi`, `/api/agent`)
- [x] 3.2 Implement `/api/code/*` reverse proxy to OpenCode single instance at `:4096`
- [x] 3.3 Implement `/api/bi/*` reverse proxy with automatic `X-DE-TOKEN` injection
- [x] 3.4 Implement `/api/agent/*` reverse proxy with automatic `Authorization: Bearer` token injection
- [x] 3.5 Implement DataEase X-DE-TOKEN exchange via OIDC proxy terminal and cache it in Redis/MySQL
- [x] 3.6 Implement BuildingAI JWT generation via JIT user provisioning and cache it in Redis/MySQL
- [x] 3.7 Implement gateway audit logging middleware writing to `audit_log`
- [x] 3.8 Implement `/api/gateway/health` and `/api/gateway/stats` aggregation endpoints
- [x] 3.9 Implement platform-level access control middleware rejecting unauthorized module access

## 4. OpenCode Code Factory

- [x] 4.1 Simplify OpenCode deployment to a single instance at `:4096` with `OPENCODE_SERVER_PASSWORD`
- [x] 4.2 Implement the AI coding session chat page with message streaming and diff display
- [x] 4.3 Implement the session list/history sidebar with continue/delete/rename
- [x] 4.4 Implement the Web Terminal iframe embedding for OpenCode Web PTY
- [x] 4.5 Implement the code review page invoking OpenCode `/review` command
- [x] 4.6 Implement the change diff viewer for agent-made modifications
- [x] 4.7 Implement MCP server configuration UI backed by OpenCode `/mcp` API
- [x] 4.8 Implement model and provider configuration UI backed by OpenCode `/auth/{provider}` API
- [x] 4.9 Implement organization-level skill library stored in MySQL and loaded into sessions
- [x] 4.10 Implement project initialization generating/updating `AGENTS.md`
- [x] 4.11 Implement session sharing and export via OpenCode share API
- [x] 4.12 Implement GitHub Action installation and PR review integration

## 5. DataEase Data Insights

- [x] 5.1 Implement DataEase OIDC proxy terminal integration to obtain X-DE-TOKEN
- [x] 5.2 Implement the Dashboard Center listing and managing DataEase dashboards
- [x] 5.3 Implement the Chart Library for browsing and editing charts
- [x] 5.4 Implement the Datasets management page with create/edit/permissions
- [x] 5.5 Implement the Data Sources management page with connection testing
- [x] 5.6 Implement the Smart Q&A (NL2Chart) interface using LLM + DataEase query API
- [x] 5.7 Implement the Report Management page for scheduled reports and history
- [x] 5.8 Implement the Data Permissions page for row/column/resource-level access control
- [x] 5.9 Implement the Organization & Roles page for DataEase org/role management
- [x] 5.10 Implement the Embedded Analysis page generating dashboard/chart embed tokens

## 6. BuildingAI AI Brain

- [x] 6.1 Implement BuildingAI token exchange bridge with JIT user provisioning
- [x] 6.2 Implement the Agent Management page with create/configure/enable/disable
- [x] 6.3 Implement the Knowledge Base page with upload, indexing, and retrieval testing
- [x] 6.4 Implement the Model Center page for adding and testing LLM providers
- [x] 6.5 Implement the MCP Tools configuration page for BuildingAI
- [x] 6.6 Implement the Agent Chat page with real-time conversation and knowledge base selection
- [x] 6.7 Implement the Agent Publish page with API key and access token configuration
- [x] 6.8 Implement the Application Permissions page for BuildingAI console RBAC

## 7. Smart Pipeline Engine

- [x] 7.1 Implement the visual pipeline canvas with drag-and-drop nodes for OpenCode, DataEase, and BuildingAI
- [x] 7.2 Implement the Template Market with pre-built pipeline templates
- [x] 7.3 Implement the pipeline execution engine with DAG scheduling and step orchestration
- [x] 7.4 Implement trigger configuration supporting manual, cron, webhook, and event triggers
- [x] 7.5 Implement the Execution History page with logs, status, and retry support
- [x] 7.6 Implement cross-system context passing between pipeline steps using a JSON context object
- [x] 7.7 Implement sandboxed execution for OpenCode-generated code using containers

## 8. Platform Operations & System Management

- [x] 8.1 Implement the User Management page backed by Keycloak Admin API
- [x] 8.2 Implement the Role Permissions page mapping Keycloak roles to platform roles and menu permissions
- [x] 8.3 Implement the Subsystem Connections page for configuring OpenCode/DataEase/BuildingAI URLs and credentials
- [x] 8.4 Implement the API Keys page for generating and revoking external access keys
- [x] 8.5 Implement the Notification Settings page for email, webhook, WeCom, DingTalk, and Lark channels
- [x] 8.6 Implement the Operation Logs page for searching and exporting audit logs
- [x] 8.7 Implement the System Settings page for platform-level configuration

## 9. Unified Frontend SPA

- [x] 9.1 Initialize the frontend project with React, Vite, TailwindCSS, and the Indigo design system
- [x] 9.2 Implement the layout framework with sidebar, top bar, multi-tab workspace, and command palette
- [x] 9.3 Implement the Dashboard workspace with metric cards, shortcuts, activity timeline, and service health
- [x] 9.4 Implement the global command palette and search with role-based filtering
- [x] 9.5 Implement the service health status indicator in the top bar with 30s polling
- [x] 9.6 Implement responsive layout for desktop, tablet, and mobile breakpoints

## 10. Deployment & Validation

- [x] 10.1 Update the Docker Compose orchestration to include all services (frontend, gateway, Keycloak, MySQL, Redis, OpenCode, DataEase, BuildingAI)
- [x] 10.2 Unify ports to `3000` (frontend), `3001` (gateway), `8080` (Keycloak), `4096` (OpenCode), `3306` (MySQL), `6379` (Redis)
- [x] 10.3 Write end-to-end tests covering login, module access, and key user flows
- [x] 10.4 Write deployment and migration documentation for operators
