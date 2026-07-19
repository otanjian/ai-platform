## Why

需要在代码工场内快速打开 OpenCode 本地工作台/配置界面，而不跳转新窗口。在菜单「GitHub 自动化」下增加「配置管理」，主区 iframe 嵌入 `http://127.0.0.1:4096/`。

## What Changes

- 菜单：`code_factory.config` → `/code-factory/config`
- 页面：全屏 iframe 嵌入 OpenCode 根地址；**标题显示在顶栏**（侧栏折叠按钮与服务状态之间），**不展示**页面内标题/描述
- 平台侧裁切 OpenCode 顶栏（DEV / 工作区 / +），不修改 OpenCode 源码
- 同步 `方案思路.md`

## Capabilities

### New Capabilities
- `opencode-config-embed`: 平台菜单嵌入 OpenCode Web 根页的配置管理入口

### Modified Capabilities
- （无）

## Impact

- Frontend：`ConfigManagePage.tsx`、`CodeFactoryPage.tsx`、`TopBar.tsx`
- Gateway：`seed.ts` / `platform.ts` 菜单项
- 文档：`方案思路.md`、本 change
