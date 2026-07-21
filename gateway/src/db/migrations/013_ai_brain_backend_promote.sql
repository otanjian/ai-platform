-- Promote「智能体后台」to AI Brain L2 (sibling of「设置」)
USE aiplatform;

UPDATE role_menu_permission
SET parent_code = 'ai_brain', sort_order = 7
WHERE menu_code = 'ai_brain.settings.backend';
