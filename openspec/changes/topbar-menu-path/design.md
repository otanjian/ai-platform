## Context

`TopBar` 左侧在折叠按钮旁展示服务健康状态（`useHealth` + Activity 图标）。侧栏菜单来自 `useMenu()`（`/session/menu`），结构为一级分组 + 二级叶子，`Sidebar` 已用 `pathname === path` 或 `pathname.startsWith(path + '/')` 判断激活项。用户希望该区域改为显示当前菜单路径。

## Goals / Non-Goals

**Goals:**

- 顶栏显示当前菜单路径，格式为 `一级label / 二级label`（例：`代码工厂 / 会话列表`）
- 路径与侧栏菜单同源、规则一致
- 移除顶栏服务健康状态 UI 与 `useHealth` 依赖

**Non-Goals:**

- 不改菜单 API / 后端
- 不把服务状态挪到别处（本次直接去掉）
- 不做可点击面包屑导航
- 不重构整个 Sidebar 菜单匹配逻辑（可抽小函数复用，但不强制大改）

## Decisions

1. **从菜单树反查路径（方案 1）**  
   - 用 `useMenu()` + `useLocation()`，在树中找匹配当前 pathname 的节点链，拼接 label。  
   - 备选：静态 `PAGE_TITLES` 映射（易与菜单漂移）；统一 breadcrumb context（过重）。

2. **匹配规则与侧栏对齐**  
   - 节点匹配：`pathname === item.path` 或 `pathname.startsWith(item.path + '/')`。  
   - 取最深匹配链（二级优先于仅匹配一级）。  
   - 一级无子项且自身匹配时，只显示该一级 label。

3. **展示位置与样式**  
   - 替换原健康状态区块；去掉 Activity 图标。  
   - 纯文本，分隔符为 ` / `；样式沿用现有顶栏次要文案（`text-sm text-slate-600`）即可。  
   - 删除几乎未使用的 `PAGE_TITLES` 特例（或一并纳入菜单路径逻辑，避免双通道）。

4. **兜底**  
   - 菜单未加载或无匹配：不渲染路径文案（空白），不抛错、不显示「未知」。

5. **实现落点**  
   - 主改 `TopBar.tsx`；路径解析可放同文件纯函数，或 `frontend/src/lib/menuPath.ts` 便于单测。

## Risks / Trade-offs

- [子路径误匹配更短父 path] → 用最长/最深匹配链，与侧栏一致  
- [菜单加载前闪一下空白] → 可接受；与侧栏空态一致  
- [健康状态入口消失] → 已确认本次直接移除，后续若需要可另开变更

## Migration Plan

- 纯前端变更，部署即生效；回滚恢复 `TopBar` 健康状态逻辑即可。

## Open Questions

- 无（已确认：直接替换服务状态；格式 `一级 / 二级`）。
