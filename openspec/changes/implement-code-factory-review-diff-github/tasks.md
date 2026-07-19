## 1. Gateway OpenCode client & helpers

- [x] 1.1 Add unit tests for review result parsing (text + risk labels) and GitHub workflow YAML generation
- [x] 1.2 Implement `parseReviewResult` / `buildGithubWorkflowYaml` helpers
- [x] 1.3 Extend `opencode-client` with `runSessionCommand`, `getSessionDiff`, `getVcsDiff` (directory-aware)

## 2. Gateway APIs

- [x] 2.1 Add `POST /projects/:id/review` with access check, empty-diff short-circuit, OpenCode review command
- [x] 2.2 Add `GET /projects/:id/sessions/:sessionId/diff` with ownership check
- [x] 2.3 Add `GET /code-factory/github-workflow` (or equivalent) returning generated YAML from trigger query

## 3. Frontend pages

- [x] 3.1 Implement `CodeReviewPage` (project/session/args, run review, risks + body, empty/error states)
- [x] 3.2 Implement `DiffPage` (project/session, file list + patch viewer, empty state)
- [x] 3.3 Implement `GithubAutomationPage` (triggers, YAML preview, copy/download, install steps)

## 4. Docs & verification

- [x] 4.1 Update `方案思路.md` for 代码审查 / 变更 Diff / GitHub 自动化 to match this design
- [x] 4.2 Run gateway + frontend unit tests and fix failures
