/**
 * Static mirror of BuildingAI console menus under AI Brain.
 * 「设置」与「智能体后台」均为 AI大脑 下的 L2；设置叶子为 L3，智能体后台叶子为 L3。
 * Platform path `/ai-brain/settings/...` maps to BuildingAI `/console/...` by prefix replace.
 */

export type FlatMenuItem = {
  code: string
  label: string
  icon: string
  path: string
  parent: string | null
  sort: number
}

/** Settings subtree only (parent of L2 items is ai_brain.settings). */
export const AI_BRAIN_SETTINGS_MENU_ITEMS: FlatMenuItem[] = [
  // L2 leaves / group under 设置（无「工作空间」中间层）
  {
    code: "ai_brain.settings.dashboard",
    label: "数据看板",
    icon: "ChartLine",
    path: "/ai-brain/settings/dashboard",
    parent: "ai_brain.settings",
    sort: 1,
  },
  {
    code: "ai_brain.settings.agent.list",
    label: "智能体列表",
    icon: "Bot",
    path: "/ai-brain/settings/agent",
    parent: "ai_brain.settings",
    sort: 2,
  },
  {
    code: "ai_brain.settings.agent.config",
    label: "智能体配置",
    icon: "Settings2",
    path: "/ai-brain/settings/agent/config",
    parent: "ai_brain.settings",
    sort: 3,
  },
  {
    code: "ai_brain.settings.datasets.list",
    label: "知识库列表",
    icon: "Library",
    path: "/ai-brain/settings/datasets",
    parent: "ai_brain.settings",
    sort: 4,
  },
  {
    code: "ai_brain.settings.datasets.config",
    label: "知识库配置",
    icon: "Settings2",
    path: "/ai-brain/settings/datasets/config",
    parent: "ai_brain.settings",
    sort: 5,
  },
  {
    code: "ai_brain.settings.mcp",
    label: "MCP",
    icon: "Wrench",
    path: "/ai-brain/settings/mcp",
    parent: "ai_brain.settings",
    sort: 6,
  },
  {
    code: "ai_brain.settings.provider",
    label: "模型厂商",
    icon: "BrainCircuit",
    path: "/ai-brain/settings/provider",
    parent: "ai_brain.settings",
    sort: 7,
  },
  {
    code: "ai_brain.settings.secret",
    label: "密钥管理",
    icon: "KeyRound",
    path: "/ai-brain/settings/secret",
    parent: "ai_brain.settings",
    sort: 8,
  },
  {
    code: "ai_brain.settings.extension",
    label: "应用管理",
    icon: "LayoutGrid",
    path: "/ai-brain/settings/extension",
    parent: "ai_brain.settings",
    sort: 9,
  },

  // L2 under AI大脑（与「设置」平级）: 智能体后台 → L3 leaves
  {
    code: "ai_brain.settings.backend",
    label: "智能体后台",
    icon: "Server",
    path: "/ai-brain/backend",
    parent: "ai_brain",
    sort: 7,
  },
  {
    code: "ai_brain.settings.operation",
    label: "营销中心",
    icon: "Store",
    path: "/ai-brain/settings/operation",
    parent: "ai_brain.settings.backend",
    sort: 1,
  },
  {
    code: "ai_brain.settings.decorate.layout",
    label: "布局配置",
    icon: "LayoutTemplate",
    path: "/ai-brain/settings/decorate/layout",
    parent: "ai_brain.settings.backend",
    sort: 2,
  },
  {
    code: "ai_brain.settings.decorate.apps",
    label: "应用中心",
    icon: "AppWindow",
    path: "/ai-brain/settings/decorate/apps",
    parent: "ai_brain.settings.backend",
    sort: 3,
  },
  {
    code: "ai_brain.settings.decorate.agents",
    label: "智能体广场装修",
    icon: "Sparkles",
    path: "/ai-brain/settings/decorate/agents",
    parent: "ai_brain.settings.backend",
    sort: 4,
  },
  {
    code: "ai_brain.settings.chat.record",
    label: "对话记录",
    icon: "MessageSquare",
    path: "/ai-brain/settings/chat/record",
    parent: "ai_brain.settings.backend",
    sort: 5,
  },
  {
    code: "ai_brain.settings.chat.config",
    label: "对话配置",
    icon: "Settings2",
    path: "/ai-brain/settings/chat/config",
    parent: "ai_brain.settings.backend",
    sort: 6,
  },
  {
    code: "ai_brain.settings.user.list",
    label: "智能体用户",
    icon: "Users",
    path: "/ai-brain/settings/user/list",
    parent: "ai_brain.settings.backend",
    sort: 7,
  },
  {
    code: "ai_brain.settings.order.membership",
    label: "会员订单",
    icon: "BadgeCheck",
    path: "/ai-brain/settings/order/membership",
    parent: "ai_brain.settings.backend",
    sort: 8,
  },
  {
    code: "ai_brain.settings.order.recharge",
    label: "充值订单",
    icon: "Wallet",
    path: "/ai-brain/settings/order/recharge",
    parent: "ai_brain.settings.backend",
    sort: 9,
  },
  {
    code: "ai_brain.settings.notice.sms",
    label: "短信配置",
    icon: "MessageCircle",
    path: "/ai-brain/settings/notice/sms",
    parent: "ai_brain.settings.backend",
    sort: 10,
  },
  {
    code: "ai_brain.settings.notice.notification-settings",
    label: "通知设置",
    icon: "BellRing",
    path: "/ai-brain/settings/notice/notification-settings",
    parent: "ai_brain.settings.backend",
    sort: 11,
  },
  {
    code: "ai_brain.settings.channel.wechat-oa",
    label: "微信公众号",
    icon: "Share2",
    path: "/ai-brain/settings/channel/wechat-oa",
    parent: "ai_brain.settings.backend",
    sort: 12,
  },
  {
    code: "ai_brain.settings.financial.analysis",
    label: "财务中心",
    icon: "ChartColumn",
    path: "/ai-brain/settings/financial/analysis",
    parent: "ai_brain.settings.backend",
    sort: 13,
  },
  {
    code: "ai_brain.settings.financial.balance-details",
    label: "余额明细",
    icon: "Receipt",
    path: "/ai-brain/settings/financial/balance-details",
    parent: "ai_brain.settings.backend",
    sort: 14,
  },
  {
    code: "ai_brain.settings.access.permission",
    label: "权限列表",
    icon: "Key",
    path: "/ai-brain/settings/access/permission",
    parent: "ai_brain.settings.backend",
    sort: 15,
  },
  {
    code: "ai_brain.settings.access.role",
    label: "角色列表",
    icon: "UserCog",
    path: "/ai-brain/settings/access/role",
    parent: "ai_brain.settings.backend",
    sort: 16,
  },
  {
    code: "ai_brain.settings.access.menu",
    label: "菜单列表",
    icon: "Menu",
    path: "/ai-brain/settings/access/menu",
    parent: "ai_brain.settings.backend",
    sort: 17,
  },
  {
    code: "ai_brain.settings.system.login-config",
    label: "登录配置",
    icon: "LogIn",
    path: "/ai-brain/settings/system/login-config",
    parent: "ai_brain.settings.backend",
    sort: 18,
  },
  {
    code: "ai_brain.settings.system.agreement",
    label: "政策协议",
    icon: "FileText",
    path: "/ai-brain/settings/system/agreement",
    parent: "ai_brain.settings.backend",
    sort: 19,
  },
  {
    code: "ai_brain.settings.system.website-config",
    label: "站点信息",
    icon: "Globe",
    path: "/ai-brain/settings/system/website-config",
    parent: "ai_brain.settings.backend",
    sort: 20,
  },
  {
    code: "ai_brain.settings.system.pay-config",
    label: "支付配置",
    icon: "CreditCard",
    path: "/ai-brain/settings/system/pay-config",
    parent: "ai_brain.settings.backend",
    sort: 21,
  },
  {
    code: "ai_brain.settings.system.storage-config",
    label: "存储配置",
    icon: "HardDrive",
    path: "/ai-brain/settings/system/storage-config",
    parent: "ai_brain.settings.backend",
    sort: 22,
  },
  {
    code: "ai_brain.settings.system.pm2-log-rotate",
    label: "日志切割",
    icon: "ScrollText",
    path: "/ai-brain/settings/system/pm2-log-rotate",
    parent: "ai_brain.settings.backend",
    sort: 23,
  },
]

/** Directory-only codes (expand only; no iframe). */
export const AI_BRAIN_SETTINGS_DIRECTORY_CODES = new Set([
  "ai_brain.settings",
  "ai_brain.settings.backend",
])

export function platformSettingsPathToConsolePath(platformPath: string): string | null {
  if (!platformPath.startsWith("/ai-brain/settings/")) return null
  const rest = platformPath.slice("/ai-brain/settings".length)
  if (!rest || rest === "/") return null
  return `/console${rest}`
}
