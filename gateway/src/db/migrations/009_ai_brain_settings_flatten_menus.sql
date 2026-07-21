-- Flatten AI Brain settings menus to max 3 levels: 设置 → 分组 → 叶子
USE aiplatform;

-- Remove middle-directory menu codes
DELETE FROM role_menu_permission
WHERE menu_code IN (
  'ai_brain.settings.agent',
  'ai_brain.settings.datasets',
  'ai_brain.settings.decorate',
  'ai_brain.settings.chat',
  'ai_brain.settings.user',
  'ai_brain.settings.order',
  'ai_brain.settings.notice',
  'ai_brain.settings.channel',
  'ai_brain.settings.financial',
  'ai_brain.settings.access',
  'ai_brain.settings.system'
);

-- Re-parent former L4 leaves under L2 groups (refresh labels and sort)
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', display_name = '智能体列表', icon = 'Bot', sort_order = 1
WHERE menu_code = 'ai_brain.settings.agent.list';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', display_name = '智能体配置', icon = 'Settings2', sort_order = 2
WHERE menu_code = 'ai_brain.settings.agent.config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', display_name = '知识库列表', icon = 'Library', sort_order = 3
WHERE menu_code = 'ai_brain.settings.datasets.list';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', display_name = '知识库配置', icon = 'Settings2', sort_order = 4
WHERE menu_code = 'ai_brain.settings.datasets.config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', sort_order = 5
WHERE menu_code = 'ai_brain.settings.mcp';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', sort_order = 6
WHERE menu_code = 'ai_brain.settings.provider';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', sort_order = 7
WHERE menu_code = 'ai_brain.settings.secret';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.workspace', sort_order = 8
WHERE menu_code = 'ai_brain.settings.extension';

UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 1
WHERE menu_code = 'ai_brain.settings.operation';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 2
WHERE menu_code = 'ai_brain.settings.decorate.layout';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 3
WHERE menu_code = 'ai_brain.settings.decorate.apps';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 4
WHERE menu_code = 'ai_brain.settings.decorate.agents';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', icon = 'MessageSquare', sort_order = 5
WHERE menu_code = 'ai_brain.settings.chat.record';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 6
WHERE menu_code = 'ai_brain.settings.chat.config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', display_name = '智能体用户', icon = 'Users', sort_order = 7
WHERE menu_code = 'ai_brain.settings.user.list';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 8
WHERE menu_code = 'ai_brain.settings.order.membership';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 9
WHERE menu_code = 'ai_brain.settings.order.recharge';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 10
WHERE menu_code = 'ai_brain.settings.notice.sms';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 11
WHERE menu_code = 'ai_brain.settings.notice.notification-settings';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', icon = 'Share2', sort_order = 12
WHERE menu_code = 'ai_brain.settings.channel.wechat-oa';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 13
WHERE menu_code = 'ai_brain.settings.financial.analysis';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 14
WHERE menu_code = 'ai_brain.settings.financial.balance-details';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 15
WHERE menu_code = 'ai_brain.settings.access.permission';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 16
WHERE menu_code = 'ai_brain.settings.access.role';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 17
WHERE menu_code = 'ai_brain.settings.access.menu';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 18
WHERE menu_code = 'ai_brain.settings.system.login-config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 19
WHERE menu_code = 'ai_brain.settings.system.agreement';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 20
WHERE menu_code = 'ai_brain.settings.system.website-config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 21
WHERE menu_code = 'ai_brain.settings.system.pay-config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 22
WHERE menu_code = 'ai_brain.settings.system.storage-config';
UPDATE role_menu_permission SET parent_code = 'ai_brain.settings.backend', sort_order = 23
WHERE menu_code = 'ai_brain.settings.system.pm2-log-rotate';
