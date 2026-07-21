/**
 * 待办中心 — TaskView 导航完整镜像（L1 + L2）。
 * 平台 path `/task-hub/...` → TaskView embed URL（含 _tv 视图 + _embed 去壳）。
 */
export type FlatMenuItem = {
  code: string
  label: string
  icon: string
  path: string
  parent: string | null
  sort: number
}

export const TASK_HUB_DIRECTORY_CODES = new Set(["task_hub"])

export const TASK_HUB_MENU_ITEMS: FlatMenuItem[] = [
  { code: "task_hub", label: "待办中心", icon: "CheckSquare", path: "/task-hub", parent: null, sort: 2 },
  { code: "task_hub.inbox", label: "收件箱", icon: "Inbox", path: "/task-hub/inbox", parent: "task_hub", sort: 1 },
  { code: "task_hub.tasks", label: "任务列表", icon: "ListChecks", path: "/task-hub/tasks", parent: "task_hub", sort: 2 },
  { code: "task_hub.kanban", label: "看板", icon: "Columns3", path: "/task-hub/kanban", parent: "task_hub", sort: 3 },
  { code: "task_hub.graph", label: "关系图", icon: "GitBranch", path: "/task-hub/graph", parent: "task_hub", sort: 4 },
  { code: "task_hub.sprints", label: "Sprint", icon: "Rocket", path: "/task-hub/sprints", parent: "task_hub", sort: 5 },
  { code: "task_hub.collaboration", label: "协作", icon: "Users", path: "/task-hub/collaboration", parent: "task_hub", sort: 6 },
  { code: "task_hub.webhooks", label: "Webhooks", icon: "Webhook", path: "/task-hub/webhooks", parent: "task_hub", sort: 7 },
  { code: "task_hub.integrations", label: "集成", icon: "Plug", path: "/task-hub/integrations", parent: "task_hub", sort: 8 },
  { code: "task_hub.messaging", label: "消息", icon: "Send", path: "/task-hub/messaging", parent: "task_hub", sort: 9 },
  { code: "task_hub.time_reports", label: "工时报表", icon: "Clock", path: "/task-hub/time-reports", parent: "task_hub", sort: 10 },
  { code: "task_hub.analytics", label: "分析", icon: "BarChart3", path: "/task-hub/analytics", parent: "task_hub", sort: 11 },
  { code: "task_hub.organizations", label: "组织", icon: "Building2", path: "/task-hub/organizations", parent: "task_hub", sort: 12 },
  { code: "task_hub.ui_customization", label: "UI 定制", icon: "Palette", path: "/task-hub/ui-customization", parent: "task_hub", sort: 13 },
  { code: "task_hub.account", label: "账号设置", icon: "UserCog", path: "/task-hub/account", parent: "task_hub", sort: 14 },
  { code: "task_hub.settings", label: "设置", icon: "Settings", path: "/task-hub/settings", parent: "task_hub", sort: 15 },
]

/** Platform leaf → TaskView view key consumed as `?_tv=` after SSO. */
export const TASK_HUB_VIEW_BY_PATH: Record<string, string> = {
  "/task-hub": "inbox",
  "/task-hub/inbox": "inbox",
  "/task-hub/tasks": "tasks",
  "/task-hub/kanban": "kanban",
  "/task-hub/graph": "graph",
  "/task-hub/sprints": "sprints",
  "/task-hub/collaboration": "collaboration",
  "/task-hub/webhooks": "webhooks",
  "/task-hub/integrations": "integrations",
  "/task-hub/messaging": "messaging",
  "/task-hub/time-reports": "time-reports",
  "/task-hub/analytics": "analytics",
  "/task-hub/organizations": "organizations",
  "/task-hub/ui-customization": "ui-customization",
  "/task-hub/account": "account",
  "/task-hub/settings": "settings",
}

/**
 * Platform leaf → TaskView embed entry URL.
 * Always lands on `/` with tokens; `_tv` selects the post-login route; `_embed=1` hides TaskView chrome.
 */
export function platformTaskHubPathToTaskViewPath(platformPath: string): string | null {
  const view = TASK_HUB_VIEW_BY_PATH[platformPath]
  if (!view) return null
  return `/?_tv=${encodeURIComponent(view)}&_embed=1`
}
