## Why

代码工场的「项目初始化」目前只有占位页面，且现有 `user_project` 表只能表达「用户个人项目」，无法支持多用户共享同一工作目录。需要把项目升级为平台级实体：可新建项目、指定服务器绝对路径、分配成员与角色，数据全部落在本平台 MySQL。

## What Changes

- 将「项目初始化」从 AGENTS.md 生成占位能力，扩展为**项目工作空间管理**（新建 / 列表 / 详情 / 成员分配）
- **BREAKING**：废弃 `user_project` 表，迁移为 `project` + `project_member`（+ 可选 `project_template`）
- 新增平台 API：项目 CRUD、成员管理、模板列表
- 前端「项目初始化」页实现完整操作界面（中文角色标签）
- 本阶段**不做** AGENTS.md 自动生成 / OpenCode `/init` 调用
- 同步更新 `方案思路.md` 中项目初始化相关描述

## Capabilities

### New Capabilities
- `project-workspace`: 平台级项目工作空间——创建项目、绑定绝对路径、多用户共享、成员角色管理
- `project-template-catalog`: 项目模板目录（Web/API/脚本等），供创建时选择；本阶段不强制组织隔离，不做 AGENTS.md 写入

### Modified Capabilities
- （无已归档主规格变更；`openspec/specs/` 当前为空）

## Impact

- **Gateway DB**：`schema.ts`、迁移脚本、seed；删除/迁移 `user_project`
- **Gateway API**：`platform.ts`（或新 `projects` 路由）增加项目与成员端点
- **Frontend**：`ProjectInitPage.tsx` 及路由；可能新增项目详情子页/弹窗组件
- **文档**：`方案思路.md` 菜单与功能定义需与「工作空间管理」对齐
- **权限**：沿用现有菜单权限 `code_factory.project_init`；项目级角色（所有者/管理员/成员/观察者）在应用层校验
