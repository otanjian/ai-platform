## Context

菜单与权限存在 `role_menu_permission`（按 `menu_code`），seed 与 `platform.ts` fallback 各有一份代码工场子菜单列表。前端 `CodeFactoryPage` 注册对应路由与占位/嵌入页。方案全景见 `方案思路.md`。

待下线 codes：

- `code_factory.terminal` → `/code-factory/terminal`
- `code_factory.mcp` → `/code-factory/mcp`
- `code_factory.models` → `/code-factory/models`
- `code_factory.skills` → `/code-factory/skills`
- `code_factory.share` → `/code-factory/share`

## Goals / Non-Goals

**Goals:**

- 侧栏、直链、文档三处一致：上述入口不可见且不可用
- 已有库通过 migration 删除权限行
- 更新 `方案思路.md` 菜单树与相关段落

**Non-Goals:**

- 不改 AI 大脑的模型/MCP 菜单
- 不删除 OpenCode 后端能力本身（仅去掉平台入口）
- 不归档/改写历史 change `implement-aiplatform-from-design`

## Decisions

1. **Migration 删除 `role_menu_permission` 行**（按 menu_code IN (...)）—— seed 只 insert-if-missing，无法清存量。  
2. **同时改 seed + platform fallback**，避免新环境与无 DB 回退仍露出菜单。  
3. **删除前端路由与页面文件**，避免死链占位。  
4. **文档**：`方案思路.md` 菜单树去掉五项；能力矩阵/章节若专指这些入口则改为移除或标注「不作为平台菜单入口」。

## Risks / Trade-offs

- [书签直链 404] → 可接受；属完整下线  
- [历史 OpenSpec 仍描述 Web 终端等] → 不回改归档 change，以本 change + 方案思路为准  

## Migration Plan

1. 部署 migration `006_remove_code_factory_menus.sql`  
2. 部署 gateway + frontend  
3. 回滚：恢复 seed/fallback/路由/文档并反向插入权限（一般不需要）

## Open Questions

- 无
