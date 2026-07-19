## 1. Database Schema & Migration

- [x] 1.1 Replace `userProject` in `gateway/src/db/schema.ts` with `project`, `projectMember`, and `projectTemplate` tables
- [x] 1.2 Add SQL migration to create new tables, migrate `user_project` rows into `project` + `project_member`, then drop `user_project`
- [x] 1.3 Seed default project templates (web / api / script) in `seed.ts`

## 2. Gateway APIs

- [x] 2.1 Implement project list/create/get/update/archive-or-delete endpoints with path validation and membership filtering
- [x] 2.2 Implement project member list/add/update-role/remove endpoints with owner protection rules
- [x] 2.3 Implement project template list endpoint
- [x] 2.4 Add gateway unit/integration tests for project and member APIs

## 3. Frontend UI

- [x] 3.1 Implement Project Initialization list page (search, status, member count)
- [x] 3.2 Implement create-project wizard (name, absolute path, optional template, members with Chinese role labels)
- [x] 3.3 Implement project detail view with member management
- [x] 3.4 Wire API client calls and Chinese role display mapping

## 4. Documentation Sync

- [x] 4.1 Update `方案思路.md` project-init section to reflect workspace management (path, members, roles; defer AGENTS.md)
- [x] 4.2 Align menu/capability matrix rows for 项目初始化 with the new scope
