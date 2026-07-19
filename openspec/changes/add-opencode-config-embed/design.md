## Context

OpenCode 本地 Web（默认 `http://127.0.0.1:4096/`）已提供配置与工作台。平台侧仅做菜单入口 + iframe，不修改 OpenCode 源码。

## Goals / Non-Goals

**Goals:**
- 代码工场菜单增加「配置管理」
- 主区全屏嵌入 OpenCode 根 URL
- 页标题「配置管理」放在顶栏（侧栏切换按钮与健康状态之间）
- 去掉页面内标题与说明文案
- 隐藏嵌入页 OpenCode 顶栏（DEV / 工作区切换 / +），平台侧裁切，不改 OpenCode

**Non-Goals:**
- 修改 OpenCode UI / 设置弹窗结构
- 通过 BFF 代理 OpenCode（本阶段直连）

## Decisions

1. **嵌入地址**：固定 `http://127.0.0.1:4096/`（与本地开发一致）
2. **标题位置**：`TopBar` 按路由映射显示；仅配置管理路由展示该标题
3. **布局**：`ConfigManagePage` 取消 Card/标题区，负边距抵消 main padding，iframe 占满内容区
4. **隐藏 OpenCode 顶栏**：iframe `top: -36px` + `height: calc(100% + 36px)` + 容器 `overflow: hidden`（与 AI 编程会话嵌入一致）

## Risks

- OpenCode 未启动时 iframe 空白 → 文档说明依赖本地服务
- 跨端口 cookie/X-Frame：本地开发通常可嵌入；若被拒绝需后续代理
