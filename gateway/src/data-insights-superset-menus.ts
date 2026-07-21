/**
 * 数据洞察 — Apache Superset 导航完整镜像。
 */
export type FlatMenuItem = {
  code: string
  label: string
  icon: string
  path: string
  parent: string | null
  sort: number
}

export const DATA_INSIGHTS_DIRECTORY_CODES = new Set(["data_insights", "data_insights.security"])

export const DATA_INSIGHTS_SUPERSET_MENU_ITEMS: FlatMenuItem[] = [
  { code: "data_insights", label: "数据洞察", icon: "BarChart3", path: "/data-insights", parent: null, sort: 4 },
  { code: "data_insights.welcome", label: "欢迎页", icon: "Home", path: "/data-insights/welcome", parent: "data_insights", sort: 1 },
  { code: "data_insights.dashboards", label: "仪表板", icon: "LayoutTemplate", path: "/data-insights/dashboards", parent: "data_insights", sort: 2 },
  { code: "data_insights.charts", label: "图表", icon: "PieChart", path: "/data-insights/charts", parent: "data_insights", sort: 3 },
  { code: "data_insights.datasets", label: "数据集", icon: "Database", path: "/data-insights/datasets", parent: "data_insights", sort: 4 },
  { code: "data_insights.databases", label: "数据库", icon: "Server", path: "/data-insights/databases", parent: "data_insights", sort: 5 },
  { code: "data_insights.sqllab", label: "SQL Lab", icon: "Terminal", path: "/data-insights/sqllab", parent: "data_insights", sort: 6 },
  { code: "data_insights.saved_queries", label: "已保存查询", icon: "Bookmark", path: "/data-insights/saved-queries", parent: "data_insights", sort: 7 },
  { code: "data_insights.query_history", label: "查询历史", icon: "History", path: "/data-insights/query-history", parent: "data_insights", sort: 8 },
  { code: "data_insights.alerts", label: "告警", icon: "Bell", path: "/data-insights/alerts", parent: "data_insights", sort: 9 },
  { code: "data_insights.reports", label: "报表", icon: "FileText", path: "/data-insights/reports", parent: "data_insights", sort: 10 },
  { code: "data_insights.rls", label: "行级安全", icon: "Shield", path: "/data-insights/rls", parent: "data_insights", sort: 11 },
  { code: "data_insights.tasks", label: "后台任务", icon: "ListTodo", path: "/data-insights/tasks", parent: "data_insights", sort: 12 },
  { code: "data_insights.tags", label: "标签", icon: "Tags", path: "/data-insights/tags", parent: "data_insights", sort: 13 },
  { code: "data_insights.themes", label: "主题", icon: "Palette", path: "/data-insights/themes", parent: "data_insights", sort: 14 },
  { code: "data_insights.css_templates", label: "CSS 模板", icon: "Code2", path: "/data-insights/css-templates", parent: "data_insights", sort: 15 },
  { code: "data_insights.annotation_layers", label: "注解层", icon: "Layers", path: "/data-insights/annotation-layers", parent: "data_insights", sort: 16 },
  { code: "data_insights.security", label: "安全", icon: "Lock", path: "/data-insights/security", parent: "data_insights", sort: 17 },
  { code: "data_insights.security.users", label: "用户", icon: "Users", path: "/data-insights/security/users", parent: "data_insights.security", sort: 1 },
  { code: "data_insights.security.roles", label: "角色", icon: "UserCog", path: "/data-insights/security/roles", parent: "data_insights.security", sort: 2 },
  { code: "data_insights.security.groups", label: "组", icon: "Group", path: "/data-insights/security/groups", parent: "data_insights.security", sort: 3 },
  { code: "data_insights.action_log", label: "操作日志", icon: "ScrollText", path: "/data-insights/action-log", parent: "data_insights", sort: 18 },
  { code: "data_insights.extensions", label: "扩展", icon: "Puzzle", path: "/data-insights/extensions", parent: "data_insights", sort: 19 },
]

export function platformDataInsightsPathToSupersetPath(platformPath: string): string | null {
  switch (platformPath) {
    case "/data-insights":
    case "/data-insights/welcome":
      return "/welcome/"
    case "/data-insights/dashboards":
      return "/dashboard/list/"
    case "/data-insights/charts":
      return "/chart/list/"
    case "/data-insights/datasets":
      return "/tablemodelview/list/"
    case "/data-insights/databases":
      return "/databaseview/list/"
    case "/data-insights/sqllab":
      return "/sqllab/"
    case "/data-insights/saved-queries":
      return "/savedqueryview/list/"
    case "/data-insights/query-history":
      return "/sqllab/history/"
    case "/data-insights/alerts":
      return "/alert/list/"
    case "/data-insights/reports":
      return "/report/list/"
    case "/data-insights/rls":
      return "/rowlevelsecurity/list"
    case "/data-insights/tasks":
      return "/tasks/list/"
    case "/data-insights/tags":
      return "/tags/"
    case "/data-insights/themes":
      return "/theme/list/"
    case "/data-insights/css-templates":
      return "/csstemplatemodelview/list/"
    case "/data-insights/annotation-layers":
      return "/annotationlayer/list/"
    case "/data-insights/security/users":
      return "/users/"
    case "/data-insights/security/roles":
      return "/roles/"
    case "/data-insights/security/groups":
      return "/list_groups/"
    case "/data-insights/action-log":
      return "/actionlog/list"
    case "/data-insights/extensions":
      return "/extensions/list/"
    default:
      return null
  }
}
