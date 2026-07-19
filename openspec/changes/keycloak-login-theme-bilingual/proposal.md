## Why

当前 Keycloak 登录页为默认英文主题，视觉偏通用企业风，缺少中文体验与 AI/智造品牌感。需要在不改动 OIDC 认证流程的前提下，升级登录相关页面的视觉与双语文案。

## What Changes

- 新增自定义 Keycloak login theme（`aiplatform`），覆盖登录、忘记密码、错误页
- 视觉改为「左右分栏 + 神经网络光晕」科技/AI 风格；中文为主、英文为辅
- 将 `aiplatform` realm 绑定该主题，默认 locale 为中文
- 通过 Docker volume 挂载主题目录，更新 `docker-compose` / realm import

## Capabilities

### New Capabilities

- `keycloak-login-theme`: 自定义 Keycloak 登录主题（布局、样式、动效、双语文案、realm 绑定与部署挂载）

### Modified Capabilities

- （无）不改变认证协议、用户模型或 Gateway OIDC 行为

## Impact

- `keycloak/themes/aiplatform/`（新建）
- `keycloak/docker-compose.yaml`、根目录 `docker-compose.yml`（主题挂载）
- `keycloak/realm-import.json`（`loginTheme`、国际化 locale）
- 不影响 Gateway / Frontend 业务代码；需重建或重启 Keycloak 容器后生效
