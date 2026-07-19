## ADDED Requirements

### Requirement: Removed Code Factory menu entries are not exposed

The platform SHALL NOT expose the following Code Factory menu entries in the session menu tree: Web 终端 (`code_factory.terminal`), MCP 配置 (`code_factory.mcp`), 模型/Provider (`code_factory.models`), 组织技能库 (`code_factory.skills`), 会话分享 (`code_factory.share`).

#### Scenario: User opens the sidebar

- **WHEN** an authenticated user loads the main application layout
- **THEN** the Code Factory section MUST NOT list Web 终端, MCP 配置, 模型/Provider, 组织技能库, or 会话分享

#### Scenario: Existing database after migration

- **WHEN** migration that removes the retired menu codes has been applied
- **THEN** `role_menu_permission` MUST contain no rows for those five `menu_code` values

### Requirement: Removed Code Factory routes are unavailable

The frontend SHALL NOT register routes for `/code-factory/terminal`, `/code-factory/mcp`, `/code-factory/models`, `/code-factory/skills`, or `/code-factory/share`.

#### Scenario: Direct navigation to a removed path

- **WHEN** a user navigates directly to one of the removed Code Factory paths
- **THEN** the application MUST NOT render the former page for that path (no dedicated page component for that menu)

### Requirement: Design document menu panorama stays in sync

`方案思路.md` SHALL describe the Code Factory menu without the five removed entries.

#### Scenario: Reader checks the Code Factory tree in 方案思路

- **WHEN** a reader opens the Code Factory section of the menu panorama in `方案思路.md`
- **THEN** the listed entries MUST NOT include Web 终端, MCP 集成/配置, 模型与提供商, 技能库/组织技能库, or 会话分享 as platform menu items
