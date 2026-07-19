## ADDED Requirements

### Requirement: Platform provides a project template catalog
The system SHALL store project templates in MySQL (`project_template`) with name, description, type (`web` | `api` | `script` | `mobile` | `custom`), optional default path hint, optional `extra_config`, optional `organization_id`, and active flag. Organization isolation is NOT required in this version.

#### Scenario: List active templates
- **WHEN** an authorized user requests project templates
- **THEN** the system returns active templates that can be selected during project creation

#### Scenario: Create project with template
- **WHEN** a user creates a project and selects a template
- **THEN** the system stores `template_id` on the project and does not write AGENTS.md

### Requirement: Seed default templates
The system SHALL seed at least Web、API、脚本 templates for create-wizard selection.

#### Scenario: Fresh seed includes defaults
- **WHEN** database seed runs on a fresh environment
- **THEN** default templates of types web, api, and script exist and are active
