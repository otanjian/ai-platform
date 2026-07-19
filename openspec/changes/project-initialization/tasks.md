## 1. Database Schema and Migration

- [x] 1.1 Add `project`, `project_member`, and `project_template` tables in `gateway/src/db/schema.ts`
- [x] 1.2 Add Drizzle migration for new tables
- [x] 1.3 Migrate data from old `user_project` to `project` + `project_member` (role = owner)
- [x] 1.4 Remove old `user_project` table references from `gateway/src/db/seed.ts` and schema
- [x] 1.5 Seed built-in project templates (Web / API / 脚本 / 移动应用 / 自定义)

## 2. Backend API

- [ ] 2.1 Implement `GET /api/projects` to list projects for the current user
- [ ] 2.2 Implement `POST /api/projects` to create a project with path validation
- [ ] 2.3 Implement `GET /api/projects/:id` to get project details
- [ ] 2.4 Implement `PUT /api/projects/:id` to update project (owner/admin only)
- [ ] 2.5 Implement `DELETE /api/projects/:id` to archive/delete project (owner only)
- [ ] 2.6 Implement `GET /api/projects/:id/members` to list project members
- [ ] 2.7 Implement `POST /api/projects/:id/members` to add a member (owner/admin)
- [ ] 2.8 Implement `PUT /api/projects/:id/members/:userId` to update member role (owner/admin)
- [ ] 2.9 Implement `DELETE /api/projects/:id/members/:userId` to remove a member (owner/admin)
- [ ] 2.10 Implement `GET /api/project-templates` to list built-in templates
- [ ] 2.11 Add ownership/role checks for all project endpoints

## 3. Frontend UI

- [ ] 3.1 Replace `ProjectInitPage.tsx` placeholder with project list page
- [ ] 3.2 Create `ProjectList` component with search, filter, and status display
- [ ] 3.3 Create `CreateProjectModal` with steps: basic info, template selection, member assignment
- [ ] 3.4 Create `ProjectDetailPage` with tabs: overview, members, settings
- [ ] 3.5 Create `ProjectMemberManager` component for adding/removing/changing roles
- [ ] 3.6 Add role display mapping: owner → 所有者, admin → 管理员, member → 成员, viewer → 观察者
- [ ] 3.7 Add API hooks/services for project and member management
- [ ] 3.8 Update `CodeFactoryPage.tsx` routing if needed

## 4. Documentation and Cleanup

- [ ] 4.1 Update `方案思路.md` section 2.2.x "项目初始化" to match new project management design
- [ ] 4.2 Update implementation matrix in `方案思路.md` if needed
- [ ] 4.3 Run backend tests (`bun test`) and fix failures
- [ ] 4.4 Verify frontend builds without lint errors
- [ ] 4.5 Verify migration runs on fresh and existing databases
