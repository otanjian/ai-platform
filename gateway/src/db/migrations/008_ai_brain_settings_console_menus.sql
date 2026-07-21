-- Mirror BuildingAI console menus under ai_brain.settings (static route A)
USE aiplatform;

-- Insert each settings descendant for every role that already has ai_brain
-- Rows are idempotent via NOT EXISTS on (role_id, menu_code)

INSERT INTO role_menu_permission (role_id, menu_code, parent_code, display_name, icon, sort_order, permission)
SELECT rmp.role_id, v.menu_code, v.parent_code, v.display_name, v.icon, v.sort_order, rmp.permission
FROM role_menu_permission rmp
CROSS JOIN (
  SELECT 'ai_brain.settings.dashboard' AS menu_code, 'ai_brain.settings' AS parent_code, '数据看板' AS display_name, 'ChartLine' AS icon, 1 AS sort_order
  UNION ALL SELECT 'ai_brain.settings.workspace', 'ai_brain.settings', '工作空间', 'Folder', 2
  UNION ALL SELECT 'ai_brain.settings.agent', 'ai_brain.settings.workspace', '智能体管理', 'Bot', 1
  UNION ALL SELECT 'ai_brain.settings.agent.list', 'ai_brain.settings.agent', '智能体列表', 'List', 1
  UNION ALL SELECT 'ai_brain.settings.agent.config', 'ai_brain.settings.agent', '智能体配置', 'Settings2', 2
  UNION ALL SELECT 'ai_brain.settings.datasets', 'ai_brain.settings.workspace', '知识库管理', 'Library', 2
  UNION ALL SELECT 'ai_brain.settings.datasets.list', 'ai_brain.settings.datasets', '知识库列表', 'List', 1
  UNION ALL SELECT 'ai_brain.settings.datasets.config', 'ai_brain.settings.datasets', '知识库配置', 'Settings2', 2
  UNION ALL SELECT 'ai_brain.settings.mcp', 'ai_brain.settings.workspace', 'MCP', 'Wrench', 3
  UNION ALL SELECT 'ai_brain.settings.provider', 'ai_brain.settings.workspace', '模型厂商', 'BrainCircuit', 4
  UNION ALL SELECT 'ai_brain.settings.secret', 'ai_brain.settings.workspace', '密钥管理', 'KeyRound', 5
  UNION ALL SELECT 'ai_brain.settings.extension', 'ai_brain.settings.workspace', '应用管理', 'LayoutGrid', 6
  UNION ALL SELECT 'ai_brain.settings.backend', 'ai_brain.settings', '智能体后台', 'Server', 3
  UNION ALL SELECT 'ai_brain.settings.operation', 'ai_brain.settings.backend', '营销中心', 'Store', 1
  UNION ALL SELECT 'ai_brain.settings.decorate', 'ai_brain.settings.backend', '装修中心', 'Paintbrush', 2
  UNION ALL SELECT 'ai_brain.settings.decorate.layout', 'ai_brain.settings.decorate', '布局配置', 'LayoutTemplate', 1
  UNION ALL SELECT 'ai_brain.settings.decorate.apps', 'ai_brain.settings.decorate', '应用中心', 'AppWindow', 2
  UNION ALL SELECT 'ai_brain.settings.decorate.agents', 'ai_brain.settings.decorate', '智能体广场装修', 'Sparkles', 3
  UNION ALL SELECT 'ai_brain.settings.chat', 'ai_brain.settings.backend', '对话管理', 'MessageSquare', 3
  UNION ALL SELECT 'ai_brain.settings.chat.record', 'ai_brain.settings.chat', '对话记录', 'ScrollText', 1
  UNION ALL SELECT 'ai_brain.settings.chat.config', 'ai_brain.settings.chat', '对话配置', 'Settings2', 2
  UNION ALL SELECT 'ai_brain.settings.user', 'ai_brain.settings.backend', '智能体用户', 'Users', 4
  UNION ALL SELECT 'ai_brain.settings.user.list', 'ai_brain.settings.user', '用户列表', 'List', 1
  UNION ALL SELECT 'ai_brain.settings.order', 'ai_brain.settings.backend', '订单管理', 'ClipboardList', 5
  UNION ALL SELECT 'ai_brain.settings.order.membership', 'ai_brain.settings.order', '会员订单', 'BadgeCheck', 1
  UNION ALL SELECT 'ai_brain.settings.order.recharge', 'ai_brain.settings.order', '充值订单', 'Wallet', 2
  UNION ALL SELECT 'ai_brain.settings.notice', 'ai_brain.settings.backend', '消息通知', 'Bell', 6
  UNION ALL SELECT 'ai_brain.settings.notice.sms', 'ai_brain.settings.notice', '短信配置', 'MessageCircle', 1
  UNION ALL SELECT 'ai_brain.settings.notice.notification-settings', 'ai_brain.settings.notice', '通知设置', 'BellRing', 2
  UNION ALL SELECT 'ai_brain.settings.channel', 'ai_brain.settings.backend', '渠道管理', 'Share2', 7
  UNION ALL SELECT 'ai_brain.settings.channel.wechat-oa', 'ai_brain.settings.channel', '微信公众号', 'MessageCircle', 1
  UNION ALL SELECT 'ai_brain.settings.financial', 'ai_brain.settings.backend', '财务管理', 'CircleDollarSign', 8
  UNION ALL SELECT 'ai_brain.settings.financial.analysis', 'ai_brain.settings.financial', '财务中心', 'ChartColumn', 1
  UNION ALL SELECT 'ai_brain.settings.financial.balance-details', 'ai_brain.settings.financial', '余额明细', 'Receipt', 2
  UNION ALL SELECT 'ai_brain.settings.access', 'ai_brain.settings.backend', '权限管理', 'Shield', 9
  UNION ALL SELECT 'ai_brain.settings.access.permission', 'ai_brain.settings.access', '权限列表', 'Key', 1
  UNION ALL SELECT 'ai_brain.settings.access.role', 'ai_brain.settings.access', '角色列表', 'UserCog', 2
  UNION ALL SELECT 'ai_brain.settings.access.menu', 'ai_brain.settings.access', '菜单列表', 'Menu', 3
  UNION ALL SELECT 'ai_brain.settings.system', 'ai_brain.settings.backend', '系统设置', 'Settings2', 10
  UNION ALL SELECT 'ai_brain.settings.system.login-config', 'ai_brain.settings.system', '登录配置', 'LogIn', 1
  UNION ALL SELECT 'ai_brain.settings.system.agreement', 'ai_brain.settings.system', '政策协议', 'FileText', 2
  UNION ALL SELECT 'ai_brain.settings.system.website-config', 'ai_brain.settings.system', '站点信息', 'Globe', 3
  UNION ALL SELECT 'ai_brain.settings.system.pay-config', 'ai_brain.settings.system', '支付配置', 'CreditCard', 4
  UNION ALL SELECT 'ai_brain.settings.system.storage-config', 'ai_brain.settings.system', '存储配置', 'HardDrive', 5
  UNION ALL SELECT 'ai_brain.settings.system.pm2-log-rotate', 'ai_brain.settings.system', '日志切割', 'ScrollText', 6
) AS v
WHERE rmp.menu_code = 'ai_brain'
  AND NOT EXISTS (
    SELECT 1 FROM role_menu_permission x
    WHERE x.role_id = rmp.role_id AND x.menu_code = v.menu_code
  );
