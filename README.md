# 企业AI智造平台

统一集成 OpenCode、DataEase、BuildingAI 三大开源引擎的企业级 AI 制造平台。

## 架构

- **Frontend**: React + Vite + TailwindCSS (`:3000`)
- **BFF Gateway**: Bun + Hono (`:3001`)
- **Identity**: Keycloak (`:8080`)
- **Database**: MySQL 8.0 (`:3306`)
- **Cache**: Redis 7 (`:6379`)
- **OpenCode**: single instance (`:4096`)
- **DataEase**: BI platform (`:8100`)
- **BuildingAI**: AI agent platform (`:4091`)

## 快速开始（本地部署，不使用 Docker）

### 前置依赖

- MySQL 8.0（端口 3306）
- Redis 7（端口 6379）
- Keycloak 25（端口 8080）
- OpenCode 单实例（端口 4096）
- DataEase（端口 8100）
- BuildingAI（端口 4091）
- Bun 1.0+ 和 Node.js 20+

### 一键本地启动

```bash
# 启动 MySQL、Redis、Keycloak 等本地服务后
./start-local.sh
```

### 手动步骤

```bash
# 1. 初始化数据库
cd gateway
bun run db:migrate
bun run db:seed

# 2. 启动 gateway
bun run src/index.ts

# 3. 启动前端（新终端）
cd ../frontend
npm install
npm run dev
```

## 默认账号

Keycloak realm `aiplatform` 预置用户：

| 用户名 | 密码 | 角色 |
|---|---|---|
| admin | admin | super_admin |
| developer | developer | developer |
| analyst | analyst | data_analyst |
| business | business | business_user |

## 目录结构

```
.
├── start-local.sh          # 本地启动脚本
├── stop-local.sh           # 本地停止脚本
├── docker-compose.yml      # 可选容器化编排（默认不使用）
├── frontend/               # React 前端
├── gateway/                # BFF / API Gateway
├── keycloak/               # Keycloak realm 配置
└── openspec/               # OpenSpec 变更管理
```

## 部署说明

1. 复制 `gateway/config.example.yaml` 为 `gateway/config.yaml` 并按环境调整。
2. 启动本地 MySQL、Redis、Keycloak 以及三个子系统（OpenCode、DataEase、BuildingAI）。
3. 执行数据库迁移 `bun run db:migrate` 和种子数据 `bun run db:seed`。
4. 通过 `http://localhost:3000` 访问平台。

## 开发说明

- 前端代理 `/api` 到 gateway 的 `:3001` 端口。
- Gateway 通过 OIDC 与 Keycloak 集成，实现统一登录。
- DataEase 与 BuildingAI 通过 BFF 进行 token 交换和缓存。
- OpenCode 单实例运行，不单独认证，由平台网关进行菜单级准入控制。

## 测试

```bash
cd gateway
bun test
```

## 许可证

待定
