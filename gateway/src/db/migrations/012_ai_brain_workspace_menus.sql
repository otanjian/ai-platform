-- Promote BuildingAI default-nav red-box items under platform AI Brain
USE aiplatform;

UPDATE role_menu_permission SET sort_order = 3
WHERE menu_code = 'ai_brain.agents';
UPDATE role_menu_permission SET sort_order = 4
WHERE menu_code = 'ai_brain.knowledge';
UPDATE role_menu_permission SET sort_order = 6
WHERE menu_code = 'ai_brain.settings';

INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT rmp.role_id, v.menu_code, v.parent_code, v.display_name, v.icon, v.sort_order, rmp.permission
FROM role_menu_permission rmp
CROSS JOIN (
  SELECT 'ai_brain.chat' AS menu_code, 'ai_brain' AS parent_code, '对话' AS display_name, 'SquarePen' AS icon, 1 AS sort_order
  UNION ALL SELECT 'ai_brain.apps', 'ai_brain', 'AI 应用', 'LayoutGrid', 2
  UNION ALL SELECT 'ai_brain.history', 'ai_brain', '历史记录', 'History', 5
) AS v
WHERE rmp.menu_code = 'ai_brain'
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = rmp.role_id AND x.menu_code = v.menu_code
  );
