## Why

顶栏左侧红框区域当前展示服务健康状态（「所有服务正常 / 部分服务异常」），对用户导航帮助有限。打开各菜单页时，更需要一眼看到「当前所在菜单路径」，例如「代码工厂 / 会话列表」。

## What Changes

- 顶栏该区域改为展示当前菜单路径（一级 / 二级），数据来自侧栏同源的菜单树
- 移除顶栏服务健康状态展示（图标与文案）
- 不再在顶栏为该展示拉取健康检查数据

## Capabilities

### New Capabilities

- `topbar-menu-path`: 根据当前路由与菜单树，在顶栏展示可读的菜单路径

### Modified Capabilities

- （无）

## Impact

- 前端：`frontend/src/components/layout/TopBar.tsx`（主要改动）
- 可能抽取：从菜单树解析路径的小工具函数（与 `Sidebar` 匹配规则对齐）
- 依赖：复用现有 `useMenu()`；移除顶栏对 `useHealth` 的依赖
- 无后端 / API 变更
