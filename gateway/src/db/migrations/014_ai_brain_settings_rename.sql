-- Rename AI Brain L2 menu「设置」→「智能体设置」
USE aiplatform;

UPDATE role_menu_permission
SET display_name = '智能体设置'
WHERE menu_code = 'ai_brain.settings';
