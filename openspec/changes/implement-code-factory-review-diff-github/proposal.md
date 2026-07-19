## Why

代码工场「代码审查」「变更 Diff」「GitHub 自动化」三个子菜单仍是占位页，无法支撑开发者在平台内完成审查、查看 agent 变更与安装 PR 自动化。需要按方案落地可用功能，且仅改本平台代码（不改 OpenCode 源码）。

## What Changes

- 实现代码审查页：选项目 → 可选会话/审查参数 → 调用 OpenCode `review` 命令 → 展示审查结果与风险标签
- 实现变更 Diff 页：选项目与本人会话 → 拉取 session diff → 文件列表 + patch 高亮查看
- 实现 GitHub 自动化页：安装向导（生成 OpenCode GitHub Action 工作流 YAML、复制/下载、配置说明）；OpenCode 无对应 HTTP API，不在本平台代跑 `opencode github` CLI
- Gateway 新增带项目权限校验的封装 API（会话归属校验后转发 OpenCode）
- 同步更新 `方案思路.md` 中上述三节的流程、数据来源与异常处理描述

## Capabilities

### New Capabilities

- `code-factory-review`: 平台内对项目/会话发起 OpenCode `/review` 并展示结果
- `code-factory-diff`: 平台内查看本人会话的 agent 文件变更 Diff
- `code-factory-github-automation`: GitHub Action / PR review 安装向导与工作流模板

### Modified Capabilities

- （无主库 `openspec/specs/` 基线条目；不以 delta 改写历史 change）

## Impact

- **Gateway**：扩展 `opencode-client`；`platform.ts` 新增 review / session-diff /（可选）vcs-diff 与 workflow 模板接口
- **Frontend**：`CodeReviewPage.tsx`、`DiffPage.tsx`、`GithubAutomationPage.tsx` 及少量 `lib` 辅助
- **Docs**：`方案思路.md`、本 change 工件
- **OpenCode**：无源码改动；仅通过现有 HTTP API（`/session/{id}/command`、`/session/{id}/diff`、`/vcs/diff`）
