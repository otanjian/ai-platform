-- 015: Task hub + Superset menus; retire DataEase menu codes; extend subsystem enums

-- Extend enums (MySQL): add new values. Keep dataease for legacy rows.
ALTER TABLE user_system_token
  MODIFY COLUMN system ENUM('dataease', 'superset', 'taskview', 'buildingai') NOT NULL;

ALTER TABLE audit_log
  MODIFY COLUMN subsystem ENUM('opencode', 'dataease', 'taskview', 'superset', 'buildingai', 'platform') NULL;

ALTER TABLE pipeline_execution_step
  MODIFY COLUMN subsystem ENUM('opencode', 'dataease', 'taskview', 'superset', 'buildingai') NULL;

ALTER TABLE subsystem_config
  MODIFY COLUMN system ENUM('opencode', 'dataease', 'taskview', 'superset', 'buildingai') NOT NULL;

-- Reorder L1: dashboard(1) → task_hub(2) → code_factory(3) → data_insights(4) → …
UPDATE role_menu_permission SET sort_order = 3 WHERE menu_code = 'code_factory';
UPDATE role_menu_permission SET sort_order = 4 WHERE menu_code = 'data_insights';
UPDATE role_menu_permission SET sort_order = 5 WHERE menu_code = 'ai_brain';
UPDATE role_menu_permission SET sort_order = 6 WHERE menu_code = 'smart_pipeline';
UPDATE role_menu_permission SET sort_order = 7 WHERE menu_code = 'system_settings';

-- Remove obsolete DataEase-only children (and old data_insights leaves we will re-seed as Superset)
DELETE FROM role_menu_permission
WHERE menu_code IN (
  'data_insights.smart_qa',
  'data_insights.datasources',
  'data_insights.permissions',
  'data_insights.orgs',
  'data_insights.embedded',
  'data_insights.charts',
  'data_insights.datasets',
  'data_insights.reports',
  'data_insights.dashboards'
)
   OR menu_code LIKE 'data_insights.%';

-- Insert task_hub L1 for roles that should have it (mirror parent permission matrix)
INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT r.id, 'task_hub', NULL, '待办中心', 'CheckSquare', 2, v.permission
FROM platform_role r
CROSS JOIN (
  SELECT 'super_admin' AS role_name, 'admin' AS permission
  UNION ALL SELECT 'developer', 'write'
  UNION ALL SELECT 'data_analyst', 'read'
  UNION ALL SELECT 'business_user', 'write'
) AS v
WHERE r.name = v.role_name
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = r.id AND x.menu_code = 'task_hub'
  );

-- Expand task_hub children from parent permission
INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT rmp.role_id, v.menu_code, v.parent_code, v.display_name, v.icon, v.sort_order, rmp.permission
FROM role_menu_permission rmp
CROSS JOIN (
  SELECT 'task_hub.inbox' AS menu_code, 'task_hub' AS parent_code, '收件箱' AS display_name, 'Inbox' AS icon, 1 AS sort_order
  UNION ALL SELECT 'task_hub.tasks', 'task_hub', '任务列表', 'ListChecks', 2
  UNION ALL SELECT 'task_hub.kanban', 'task_hub', '看板', 'Columns3', 3
  UNION ALL SELECT 'task_hub.graph', 'task_hub', '关系图', 'GitBranch', 4
  UNION ALL SELECT 'task_hub.sprints', 'task_hub', 'Sprint', 'Rocket', 5
  UNION ALL SELECT 'task_hub.collaboration', 'task_hub', '协作', 'Users', 6
  UNION ALL SELECT 'task_hub.webhooks', 'task_hub', 'Webhooks', 'Webhook', 7
  UNION ALL SELECT 'task_hub.integrations', 'task_hub', '集成', 'Plug', 8
  UNION ALL SELECT 'task_hub.messaging', 'task_hub', '消息', 'Send', 9
  UNION ALL SELECT 'task_hub.time_reports', 'task_hub', '工时报表', 'Clock', 10
  UNION ALL SELECT 'task_hub.analytics', 'task_hub', '分析', 'BarChart3', 11
  UNION ALL SELECT 'task_hub.organizations', 'task_hub', '组织', 'Building2', 12
  UNION ALL SELECT 'task_hub.ui_customization', 'task_hub', 'UI 定制', 'Palette', 13
  UNION ALL SELECT 'task_hub.account', 'task_hub', '账号设置', 'UserCog', 14
  UNION ALL SELECT 'task_hub.settings', 'task_hub', '设置', 'Settings', 15
) AS v
WHERE rmp.menu_code = 'task_hub'
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = rmp.role_id AND x.menu_code = v.menu_code
  );

-- Re-seed Superset mirror under existing data_insights parents
INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT rmp.role_id, v.menu_code, v.parent_code, v.display_name, v.icon, v.sort_order, rmp.permission
FROM role_menu_permission rmp
CROSS JOIN (
  SELECT 'data_insights.welcome' AS menu_code, 'data_insights' AS parent_code, '欢迎页' AS display_name, 'Home' AS icon, 1 AS sort_order
  UNION ALL SELECT 'data_insights.dashboards', 'data_insights', '仪表板', 'LayoutTemplate', 2
  UNION ALL SELECT 'data_insights.charts', 'data_insights', '图表', 'PieChart', 3
  UNION ALL SELECT 'data_insights.datasets', 'data_insights', '数据集', 'Database', 4
  UNION ALL SELECT 'data_insights.databases', 'data_insights', '数据库', 'Server', 5
  UNION ALL SELECT 'data_insights.sqllab', 'data_insights', 'SQL Lab', 'Terminal', 6
  UNION ALL SELECT 'data_insights.saved_queries', 'data_insights', '已保存查询', 'Bookmark', 7
  UNION ALL SELECT 'data_insights.query_history', 'data_insights', '查询历史', 'History', 8
  UNION ALL SELECT 'data_insights.alerts', 'data_insights', '告警', 'Bell', 9
  UNION ALL SELECT 'data_insights.reports', 'data_insights', '报表', 'FileText', 10
  UNION ALL SELECT 'data_insights.rls', 'data_insights', '行级安全', 'Shield', 11
  UNION ALL SELECT 'data_insights.tasks', 'data_insights', '后台任务', 'ListTodo', 12
  UNION ALL SELECT 'data_insights.tags', 'data_insights', '标签', 'Tags', 13
  UNION ALL SELECT 'data_insights.themes', 'data_insights', '主题', 'Palette', 14
  UNION ALL SELECT 'data_insights.css_templates', 'data_insights', 'CSS 模板', 'Code2', 15
  UNION ALL SELECT 'data_insights.annotation_layers', 'data_insights', '注解层', 'Layers', 16
  UNION ALL SELECT 'data_insights.security', 'data_insights', '安全', 'Lock', 17
  UNION ALL SELECT 'data_insights.action_log', 'data_insights', '操作日志', 'ScrollText', 18
  UNION ALL SELECT 'data_insights.extensions', 'data_insights', '扩展', 'Puzzle', 19
) AS v
WHERE rmp.menu_code = 'data_insights'
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = rmp.role_id AND x.menu_code = v.menu_code
  );

INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT rmp.role_id, v.menu_code, v.parent_code, v.display_name, v.icon, v.sort_order, rmp.permission
FROM role_menu_permission rmp
CROSS JOIN (
  SELECT 'data_insights.security.users' AS menu_code, 'data_insights.security' AS parent_code, '用户' AS display_name, 'Users' AS icon, 1 AS sort_order
  UNION ALL SELECT 'data_insights.security.roles', 'data_insights.security', '角色', 'UserCog', 2
  UNION ALL SELECT 'data_insights.security.groups', 'data_insights.security', '组', 'Group', 3
) AS v
WHERE rmp.menu_code = 'data_insights.security'
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = rmp.role_id AND x.menu_code = v.menu_code
  );

-- Seed subsystem_config rows for taskview / superset if missing
INSERT INTO subsystem_config (system, base_url, auth_type)
SELECT v.system, v.base_url, v.auth_type
FROM (
  SELECT 'taskview' AS system, 'http://taskview-web:5174' AS base_url, 'token' AS auth_type
  UNION ALL SELECT 'superset', 'http://superset:8088', 'token'
) AS v
WHERE NOT EXISTS (
  SELECT 1 FROM subsystem_config x WHERE x.system = v.system
);
