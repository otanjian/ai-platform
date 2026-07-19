## Context

平台认证由 Keycloak（realm `aiplatform`）提供。当前登录页使用默认主题：英文文案、白卡片、多边形背景，与「企业级 AI 智造平台」品牌不符。Gateway / Frontend 通过标准 OIDC 跳转登录，本次只改 Keycloak 登录外观与文案。

已确认产品决策：
- 中文为主、英文为辅（无语言切换）
- 视觉：神经网络光晕
- 版式：左右分栏（移动端上下折叠）
- 范围：登录、忘记密码、错误页
- 实现：自定义 Keycloak login theme

## Goals / Non-Goals

**Goals:**

- 提供可部署的 `aiplatform` login theme，绑定到 `aiplatform` realm
- 左右分栏 + 节点连线动效 + 玻璃感表单区
- 登录 / 重置密码 / 错误页双语文案一致
- 尊重 `prefers-reduced-motion`
- 文档化本地挂载与重启验证步骤

**Non-Goals:**

- 不改 Admin Console 主题
- 不改 OIDC client、用户、角色或 Gateway 回调逻辑
- 不做运行时语言切换器
- 不自建前端登录页绕过 Keycloak

## Decisions

1. **自定义 theme 而非纯 CSS 覆盖**  
   左右分栏需要改 FreeMarker 结构；纯 CSS 无法可靠实现。  
   备选：CSS-only（否决）、前端自建登录页（否决，安全与复杂度更高）。

2. **父主题：`keycloak.v2`（Keycloak 25 默认 login 线）**  
   继承表单字段与认证动作，只覆盖布局壳与样式资源。若父主题名与镜像不一致，实现时以镜像内可用 login 父主题为准并记录。

3. **双语策略：模板结构 + messages**  
   品牌名、标题、标签在模板中固定「中文主文 + 英文辅文」；错误等 message key 在 `messages_zh.properties` 中用双语字符串覆盖。Realm 开启国际化，默认 `zh-CN`。

4. **动效：CSS + 轻量 JS 绘制节点图**  
   左侧 canvas/SVG 缓慢脉冲；`prefers-reduced-motion: reduce` 时停动画、保留静态节点。

5. **部署：volume 挂载 `keycloak/themes` → `/opt/keycloak/themes`**  
   开发态 `start-dev` 可读自定义主题；`realm-import.json` 设置 `loginTheme: aiplatform`。已有数据卷时可能需 Admin Console 手动改主题或重建卷。

## Risks / Trade-offs

- **[Risk] realm import 不覆盖已存在 realm 的 theme 设置** → 文档说明 Admin 手动设置或 `docker compose down -v` 后重导入  
- **[Risk] Keycloak 升级导致父主题 API 变化** → 锁定镜像 `25.0`，模板尽量少侵入  
- **[Risk] 动效影响低端设备** → 尊重 reduced-motion，节点数控制在少量  
- **[Trade-off] 中英同屏 vs 切换器** → 同屏更符合「双语展示」诉求，文案略密

## Migration Plan

1. 新增 theme 目录并挂载  
2. 更新 realm import / 现网 Admin 设置 `loginTheme`  
3. 重启 Keycloak，验证登录、忘记密码、错误页  
4. 回滚：将 realm `loginTheme` 改回 `keycloak`/`keycloak.v2` 并重启

## Open Questions

- 无阻塞项。实现时确认 Keycloak 25.0 父主题精确名称即可。
