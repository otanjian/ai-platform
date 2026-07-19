## Why

当前仓库已实现 OpenCode 多用户网关 + Keycloak 认证，但尚未形成完整的企业级 AI 平台。为了将 OpenCode、DataEase、BuildingAI 三个开源引擎整合为统一门户，实现"代码生成 → 数据分析 → 智能决策"的完整链路，需要按照《方案思路.md》进行全面实现，补齐统一前端、DataEase/BuildingAI 集成、智能流水线、MySQL 数据平台等关键模块。

## What Changes

- 构建统一前端 SPA（React/Vue），覆盖工作台、代码工场、数据洞察、AI大脑、智能流水线、系统管理 6 大模块
- 将现有 Bun + Hono 网关扩展为 tri-system BFF，支持 OpenCode、DataEase、BuildingAI 的统一代理、认证桥接和 token 管理
- 引入 MySQL 8.0 作为平台数据库，持久化用户、角色、token 映射、审计日志、流水线、API key、通知配置等数据
- 接入 Keycloak 统一身份认证，覆盖三个子系统，建立平台角色与 Keycloak role 的映射
- 实现 OpenCode 单实例 :4096 代理，集成 AI 编程会话、Web 终端、代码审查、技能库、GitHub 自动化等能力
- 实现 DataEase 集成，通过 OIDC 代理终端换取 X-DE-TOKEN，支持仪表板、图表、数据集、数据源、报表、数据权限等
- 实现 BuildingAI 集成，通过 BFF token exchange + JIT 用户预创建，支持智能体、知识库、模型、MCP、Agent 发布等
- 实现智能流水线引擎，支持可视化 DAG 编排、模板、触发器、执行历史、跨系统数据流转
- 实现平台运维与系统管理：用户管理、角色权限、子系统连接、API 密钥、通知设置、操作日志、系统设置

## Capabilities

### New Capabilities

- `unified-frontend-portal`: 统一前端门户，包含工作台、全局导航、命令面板、响应式布局、服务健康监控
- `keycloak-unified-auth`: Keycloak 统一认证与平台角色权限映射，覆盖 OpenCode/DataEase/BuildingAI 的 SSO 桥接
- `tri-system-gateway`: BFF tri-system gateway，负责路由代理、token 交换、权限校验、审计日志、API 聚合
- `opencode-code-factory`: 代码工场，集成 OpenCode 的 AI 编程会话、终端、代码审查、MCP、技能库、GitHub 自动化
- `dataease-data-insights`: 数据洞察，集成 DataEase 的仪表板、图表、数据集、数据源、报表、数据权限、嵌入式分析
- `buildingai-ai-brain`: AI 大脑，集成 BuildingAI 的智能体、知识库、模型、MCP 工具、Agent 对话、Agent 发布
- `smart-pipeline-engine`: 智能流水线引擎，支持 DAG 编排、模板市场、触发器、执行历史、跨系统数据传递
- `platform-ops-management`: 平台运维与系统管理，包括用户/角色、子系统连接、API 密钥、通知、审计日志、系统设置
- `mysql-data-platform`: MySQL 数据平台与 Redis 缓存，包含表结构设计、数据持久化、token 缓存、性能优化

### Modified Capabilities

- 无现有 spec 需要修改（当前 openspec/specs/ 为空，本次为全新实现）

## Impact

- 代码层面：新增 `frontend/`、扩展 `gateway/`、新增 MySQL/Redis 服务、新增平台数据库模块
- 架构层面：从单 OpenCode 网关演进为 tri-system BFF + 统一前端 + 智能流水线
- 认证层面：从 `opencode` realm 演进为 `aiplatform` realm，覆盖三系统
- 部署层面：从当前 `9090/9091` 端口演进为统一 `3000/3001/8080/4096/3306/6379`
- 数据层面：从 `config.yaml` 演进为 MySQL 持久化 + Redis 缓存
- 依赖层面：引入 Keycloak、MySQL 8.0、Redis 7、OpenCode、DataEase、BuildingAI
