## Why

代码工场侧栏中「Web 终端」「MCP 配置」「模型/Provider」「组织技能库」「会话分享」五项暂不作为产品入口，需从菜单、路由与方案文档中完整下线，避免占位页干扰导航。

## What Changes

- **BREAKING**：移除上述 5 个代码工场子菜单（侧栏不再出现，对应路径不再提供页面）
- 清理 seed / fallback 菜单定义与已落库的 `role_menu_permission` 行
- 删除前端路由与页面组件
- 同步更新 `方案思路.md` 中的菜单全景与相关描述
- 本变更以 OpenSpec change 记录范围与验收标准

## Capabilities

### New Capabilities

- `code-factory-menu-trim`: 代码工场对外暴露的菜单与路由集合（不含已下线的五项）

### Modified Capabilities

- （无正式 `openspec/specs/` 基线；相关历史描述见 `implement-aiplatform-from-design`，本次不改其归档内容）

## Impact

- 后端：`gateway/src/db/seed.ts`、`gateway/src/routes/platform.ts`、新建 migration
- 前端：`CodeFactoryPage.tsx` 及 terminal/mcp/models/skills/share 页面
- 文档：`方案思路.md`
- AI 大脑下的模型中心 / MCP 工具菜单不受影响
