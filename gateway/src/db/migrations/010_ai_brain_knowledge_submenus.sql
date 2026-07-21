-- Promote BuildingAI datasets red-box nav under platform「知识库」
USE aiplatform;

INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT rmp.role_id, v.menu_code, v.parent_code, v.display_name, v.icon, v.sort_order, rmp.permission
FROM role_menu_permission rmp
CROSS JOIN (
  SELECT 'ai_brain.knowledge.plaza' AS menu_code, 'ai_brain.knowledge' AS parent_code, '知识广场' AS display_name, 'Library' AS icon, 1 AS sort_order
  UNION ALL SELECT 'ai_brain.knowledge.mine', 'ai_brain.knowledge', '我的知识库', 'BookCopy', 2
  UNION ALL SELECT 'ai_brain.knowledge.team', 'ai_brain.knowledge', '团队知识库', 'Users', 3
  UNION ALL SELECT 'ai_brain.knowledge.create', 'ai_brain.knowledge', '创建知识库', 'Plus', 4
) AS v
WHERE rmp.menu_code = 'ai_brain'
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = rmp.role_id AND x.menu_code = v.menu_code
  );
