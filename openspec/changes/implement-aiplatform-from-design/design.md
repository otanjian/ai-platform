## Context

企业AI智造平台的目标是将 OpenCode（代码生成）、DataEase（数据分析）、BuildingAI（智能决策）三个开源引擎整合为统一门户。当前仓库已实现 OpenCode 多用户网关（Bun + Hono，端口 9090）和 Keycloak（端口 9091，realm `opencode`），但缺少统一前端、DataEase/BuildingAI 集成、智能流水线、MySQL 数据平台等关键模块。

本次变更按照《方案思路.md》进行全面实现，从单一 OpenCode 网关演进为完整的企业 AI 平台。

## Goals / Non-Goals

**Goals:**
- 实现统一前端 SPA，覆盖 6 大模块和 43 个二级菜单功能
- 扩展现有 gateway 为 tri-system BFF，支持 OpenCode、DataEase、BuildingAI 的代理和认证桥接
- 引入 MySQL 8.0 + Redis 7 作为平台数据层
- 建立 Keycloak `aiplatform` realm，统一三个子系统的身份认证
- 实现智能流水线引擎，支持跨系统 DAG 编排
- 补齐平台运维能力：用户、角色、子系统连接、API key、通知、审计、系统设置

**Non-Goals:**
- 不修改 OpenCode、DataEase、BuildingAI 的源码
- 不在第一版实现高可用集群（保持 Docker Compose 单实例部署）
- 不实现代码模板市场、代码片段库、Copilot 式自动补全（OpenCode 不支持）
- 不实现 DataEase 社区版的 OIDC（目标为 Enterprise / XPack 版本）

## Decisions

### 1. 统一前端采用 React + Vite + TailwindCSS
- **Rationale**: React 生态成熟，与 OpenCode 的 TypeScript 技术栈一致，Vite 构建快速，TailwindCSS 便于实现设计规范中的 Indigo 主题
- **Alternatives**: Vue 3 — 同样可行，但当前团队对 React 更熟悉，OpenCode 本身也是 React/SolidJS 风格

### 2. BFF 继续使用 Bun + Hono
- **Rationale**: 现有 gateway 已经是 Bun + Hono，复用可降低成本；Hono 性能优异，适合网关场景
- **Alternatives**: Express/NestJS — 需要重写现有代码，成本过高

### 3. 数据库采用 MySQL 8.0 + Drizzle ORM
- **Rationale**: MySQL 是企业常用数据库，Drizzle ORM 与 OpenCode 技术栈一致，类型安全
- **Alternatives**: PostgreSQL — 功能更强，但用户明确要求 MySQL 8.0

### 4. OpenCode 采用单实例 :4096
- **Rationale**: 简化网关路由和进程管理，避免 per-user 动态端口的复杂性
- **Alternatives**: 保留 per-user 动态端口 — 增加了 BFF 路由复杂度，且不符合目标架构
- **Security**: 通过 `OPENCODE_SERVER_PASSWORD` 限制仅 BFF 可访问

### 5. DataEase 通过 OIDC 代理终端集成
- **Rationale**: DataEase 企业版支持 OIDC，BFF 作为代理终端可将 Keycloak 用户映射为 DataEase 用户
- **Alternatives**: 使用 admin service account 代理 — 权限降级，无法区分真实用户

### 6. BuildingAI 通过 BFF token exchange + JIT 用户预创建
- **Rationale**: BuildingAI 无内置 OIDC，BFF 桥接是最小改动方案
- **Alternatives**: 扩展 BuildingAI 增加 OIDC 策略 — 需要修改 BuildingAI 代码，成本过高

### 7. 智能流水线使用数据库持久化 DAG
- **Rationale**: 流水线定义需要持久化，执行记录需要可追溯
- **Alternatives**: 纯内存执行 — 无法持久化和重试

### 8. Token 缓存使用 Redis + MySQL 持久化
- **Rationale**: Redis 热缓存避免每次请求重新换取 token，MySQL 持久化支持故障恢复
- **Alternatives**: 仅 Redis — 故障后需要重新登录换取 token

## Risks / Trade-offs

- **DataEase Enterprise 依赖** → 提前确认授权版本；如只能使用社区版，需改为 admin service account 代理方案并注明权限降级
- **BuildingAI 无内置 OIDC** → BFF 桥接方案需要维护 BuildingAI 内部登录逻辑，存在 Breaking Change 风险；需持续跟踪 BuildingAI 版本更新
- **OpenCode 单实例多用户隔离** → 单实例下用户项目目录需通过 `x-opencode-directory` 或工作区参数隔离；需要设计清晰的项目隔离策略
- **智能流水线沙箱执行** → OpenCode 生成的代码可能包含危险操作，必须在容器沙箱中执行；增加部署复杂度
- **GPL 许可证风险（DataEase）** → 仅通过 REST API 调用，不修改源码；法务确认后使用
- **跨域 iframe 嵌入** → 需要统一域名反向代理或配置各系统允许跨域；否则 iframe 内登录态不共享

## Migration Plan

1. **Phase 0（当前）**: 保留 OpenCode 多用户网关 + Keycloak `opencode` realm
2. **Phase 1**: 简化 OpenCode 为单实例 :4096，调整现有 gateway 代理逻辑
3. **Phase 2**: 引入 MySQL 8.0 + Redis 7，迁移 token 映射和审计日志到 MySQL
4. **Phase 3**: 扩展 gateway 为 tri-system BFF，实现 DataEase/BuildingAI 代理和认证桥接
5. **Phase 4**: 迁移 Keycloak realm 为 `aiplatform`，配置三系统角色映射
6. **Phase 5**: 实现统一前端 SPA，覆盖 6 大模块
7. **Phase 6**: 实现智能流水线引擎
8. **Phase 7**: 统一端口为 `3000/3001/8080/4096/3306/6379`，完整 Docker Compose 部署

**Rollback Strategy**: 每个阶段独立可回滚；数据库变更使用迁移脚本；Keycloak realm 保留旧 realm 备份；gateway 保留旧路由可切换。

## Open Questions

- DataEase 是否确认使用 Enterprise / XPack 版本？
- BuildingAI 的登录逻辑具体是调用内部 API 还是直接写 `user_token` 表？
- 是否需要高可用部署（如 MySQL 主从、Redis Cluster）？
- OpenCode 单实例下多用户项目目录隔离策略是否可行？
- 是否引入对象存储（如 MinIO）保存大体积的流水线中间数据和组织级技能文件？
