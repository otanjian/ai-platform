-- Remove workspace middle layer and promote its leaves under settings
USE aiplatform;

DELETE FROM role_menu_permission
WHERE menu_code = 'ai_brain.settings.workspace';

UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 2
WHERE menu_code = 'ai_brain.settings.agent.list';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 3
WHERE menu_code = 'ai_brain.settings.agent.config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 4
WHERE menu_code = 'ai_brain.settings.datasets.list';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 5
WHERE menu_code = 'ai_brain.settings.datasets.config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 6
WHERE menu_code = 'ai_brain.settings.mcp';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 7
WHERE menu_code = 'ai_brain.settings.provider';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 8
WHERE menu_code = 'ai_brain.settings.secret';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 9
WHERE menu_code = 'ai_brain.settings.extension';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings', sort_order = 10
WHERE menu_code = 'ai_brain.settings.backend';
