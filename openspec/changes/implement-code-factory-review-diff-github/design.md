## Context

- 菜单与路由已存在：`code_factory.review` / `diff` / `github`，前端页为占位
- 会话映射与项目权限已就绪（`opencode_session`、`assertCanAccessProject`）
- OpenCode（:4096）已提供：`POST /session/{id}/command`（含 `review`）、`GET /session/{id}/diff`、`GET /vcs/diff`；**无** GitHub 安装 HTTP API
- 约束：仅修改 `aiplatform`；配置管理页的 iframe 模式可参考，但本三页需要平台侧项目/会话 ACL，故采用原生页 + Gateway 封装

## Goals / Non-Goals

**Goals:**

- 三个菜单从占位变为可用闭环
- 所有 OpenCode 调用经 Gateway，并校验「当前用户可访问项目 / 拥有会话映射」
- 更新 `方案思路.md` 与本 change，使文档与实现一致

**Non-Goals:**

- 不修改 OpenCode 源码或依赖其内部包
- 不在 Gateway 内执行 `opencode github` / `gh` CLI 安装
- 不实现完整 PR 评论回写、GitHub OAuth App 托管
- 不替换 AI 编程会话内嵌的右侧 review 面板

## Decisions

### 1. 原生平台页 + Gateway 封装（非全页 iframe）

- **选择**：前端选项目/会话，调平台 API；Gateway 转发 OpenCode
- **备选 A**：三页都 iframe 嵌入 OpenCode — 快，但无法用平台会话 ACL，也难统一项目选择
- **备选 B**：前端直连 `:4096` — 绕过网关权限与审计
- **理由**：与会话列表/项目初始化一致，且满足「只改本项目」

### 2. 代码审查 API

- `POST /api/projects/:id/review`
  - Body：`{ sessionId?: string, arguments?: string }`
  - 校验项目访问；若无 `sessionId` 则复用 open-chat 逻辑取/建本人会话
  - 调用 OpenCode `POST /session/{sessionId}/command`，`command: "review"`，`arguments` 透传（空=未提交变更；可填分支名/PR）
  - 可选预检：`GET /vcs/diff?mode=git&directory=`，空则直接返回「没有可审查的 diff」（不发起耗时 review）
  - 响应：规范化 `{ sessionId, text, parts, risks[] }`（从 message parts 抽文本；风险标签启发式解析 critical/high/medium/low）

### 3. 变更 Diff API

- `GET /api/projects/:id/sessions/:sessionId/diff`
  - 校验项目访问 + 本人 `opencode_session` 活跃映射
  - 转发 `GET /session/{sessionId}/diff?directory=`
  - 返回 `SnapshotFileDiff[]`：`file, patch, additions, deletions, status`

### 4. GitHub 自动化 = 安装向导

- 因无 OpenCode HTTP：页面提供
  1. 说明（需仓库 Secrets / 权限）
  2. 可编辑的工作流 YAML 模板（基于官方 `sst/opencode/github` Action）
  3. 一键复制 / 下载为 `.github/workflows/opencode.yml`
  4. 可选触发条件勾选（issue_comment / pull_request 等）影响模板生成
- Gateway 可提供只读 `GET /api/code-factory/github-workflow?triggers=...` 生成 YAML（便于单测）；前端亦可本地生成同一逻辑

### 5. UI 布局

- **审查**：项目选择 → 会话下拉（本人）→ 参数输入 →「开始审查」→ 结果区（风险芯片 + Markdown/纯文本）
- **Diff**：项目 → 会话 → 左文件列表 / 右 patch（+/- 行着色）；空态提示
- **GitHub**：步骤条向导 + YAML 预览；不接真实 GitHub API

## Risks / Trade-offs

- [review 耗时长] → UI loading；Gateway 放宽超时；失败展示 OpenCode 错误文案
- [启发式风险标签不准] → 标签仅辅助；完整文本始终展示
- [GitHub 向导不能一键装到远端仓] → 文档标明需用户提交 YAML；符合无 CLI 约束
- [session diff 为空但工作区有改动] → Diff 页专注 agent 变更；审查页用 vcs 预检

## Migration Plan

1. 部署 gateway + frontend（无 DB migration）
2. 回滚：恢复三页占位即可

## Open Questions

- 无（已确认：仅改本项目；按本设计执行）
