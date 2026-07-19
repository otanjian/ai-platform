## ADDED Requirements

### Requirement: Top bar shows current menu path

The top bar SHALL display the current menu path derived from the session menu tree and the active route, instead of service health status.

#### Scenario: Nested menu item selected

- **WHEN** the user navigates to a route that matches a child menu item under a parent group (e.g. session list under Code Factory)
- **THEN** the top bar MUST show the path as `{parentLabel} / {childLabel}` (e.g. `代码工厂 / 会话列表`)

#### Scenario: Top-level leaf menu selected

- **WHEN** the user navigates to a route that matches a top-level menu item with no children
- **THEN** the top bar MUST show only that item's label

#### Scenario: No menu match

- **WHEN** the current route does not match any menu item path
- **THEN** the top bar MUST NOT show a menu path label and MUST NOT show service health status

### Requirement: Service health status removed from top bar

The top bar MUST NOT display service health status text or icons in the former status area.

#### Scenario: Opening any menu page

- **WHEN** the user opens any application page that uses the main layout top bar
- **THEN** the top bar MUST NOT show 「所有服务正常」 or 「部分服务异常」 (or equivalent health status messaging)
