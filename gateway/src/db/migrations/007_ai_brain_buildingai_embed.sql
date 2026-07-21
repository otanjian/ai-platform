-- Trim AI Brain menus to 智能体 / 知识库 / 设置 and sync display names
USE aiplatform;

DELETE FROM role_menu_permission
WHERE menu_code IN (
  'ai_brain.models',
  'ai_brain.mcp',
  'ai_brain.chat',
  'ai_brain.publish',
  'ai_brain.permissions',
  'ai_brain.orchestration'
);

UPDATE role_menu_permission
SET display_name = '智能体', icon = 'Bot', sort_order = 1
WHERE menu_code = 'ai_brain.agents';

UPDATE role_menu_permission
SET display_name = '知识库', icon = 'Library', sort_order = 2
WHERE menu_code = 'ai_brain.knowledge';

-- Grant ai_brain.settings for every role that already has ai_brain parent permission
INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT rmp.role_id, 'ai_brain.settings', 'ai_brain', '设置', 'Settings', 3, rmp.permission
FROM role_menu_permission rmp
WHERE rmp.menu_code = 'ai_brain'
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = rmp.role_id AND x.menu_code = 'ai_brain.settings'
  );
