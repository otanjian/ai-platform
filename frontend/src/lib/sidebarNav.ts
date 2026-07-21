/** Tailwind `lg` breakpoint — desktop sidebar stays in document flow. */
export const SIDEBAR_LG_MIN_WIDTH = 1024

export function isDesktopSidebarViewport(width: number): boolean {
  return width >= SIDEBAR_LG_MIN_WIDTH
}

/** Mobile drawer should close after nav; desktop main sidebar must stay put. */
export function shouldCloseMobileDrawerAfterNav(viewportWidth: number): boolean {
  return !isDesktopSidebarViewport(viewportWidth)
}

/** Map platform settings leaf path to BuildingAI console path. */
export function platformSettingsPathToConsolePath(platformPath: string): string | null {
  if (!platformPath.startsWith('/ai-brain/settings/')) return null
  const rest = platformPath.slice('/ai-brain/settings'.length)
  if (!rest || rest === '/') return null
  return `/console${rest}`
}

/** Platform knowledge leaf → BuildingAI /datasets URL (path + query, without _embed). */
export function platformKnowledgePathToDatasetsUrl(platformPath: string): string | null {
  switch (platformPath) {
    case '/ai-brain/knowledge':
    case '/ai-brain/knowledge/plaza':
      return '/datasets'
    case '/ai-brain/knowledge/mine':
      return '/datasets?scope=mine'
    case '/ai-brain/knowledge/team':
      return '/datasets?scope=team'
    case '/ai-brain/knowledge/create':
      return '/datasets?create=1'
    default:
      return null
  }
}

/** Platform workspace leaf → BuildingAI URL (path + query, without _embed). */
export function platformWorkspacePathToBuildingAiUrl(platformPath: string): string | null {
  switch (platformPath) {
    case '/ai-brain/chat':
      return '/'
    case '/ai-brain/apps':
      return '/apps'
    case '/ai-brain/history':
      return '/?_history=1'
    default:
      return null
  }
}

/** Platform task-hub leaf → TaskView path. */
export function platformTaskHubPathToTaskViewPath(platformPath: string): string | null {
  const map: Record<string, string> = {
    '/task-hub': '/',
    '/task-hub/inbox': '/',
    '/task-hub/tasks': '/',
    '/task-hub/kanban': '/',
    '/task-hub/graph': '/',
    '/task-hub/sprints': '/',
    '/task-hub/collaboration': '/',
    '/task-hub/webhooks': '/',
    '/task-hub/integrations': '/',
    '/task-hub/messaging': '/',
    '/task-hub/time-reports': '/',
    '/task-hub/analytics': '/',
    '/task-hub/organizations': '/',
    '/task-hub/ui-customization': '/',
    '/task-hub/account': '/',
    '/task-hub/settings': '/',
  }
  return map[platformPath] ?? null
}

/** Platform data-insights leaf → Superset path. */
export function platformDataInsightsPathToSupersetPath(platformPath: string): string | null {
  const map: Record<string, string> = {
    '/data-insights': '/welcome/',
    '/data-insights/welcome': '/welcome/',
    '/data-insights/dashboards': '/dashboard/list/',
    '/data-insights/charts': '/chart/list/',
    '/data-insights/datasets': '/tablemodelview/list/',
    '/data-insights/databases': '/databaseview/list/',
    '/data-insights/sqllab': '/sqllab/',
    '/data-insights/saved-queries': '/savedqueryview/list/',
    '/data-insights/query-history': '/sqllab/history/',
    '/data-insights/alerts': '/alert/list/',
    '/data-insights/reports': '/report/list/',
    '/data-insights/rls': '/rowlevelsecurity/list',
    '/data-insights/tasks': '/tasks/list/',
    '/data-insights/tags': '/tags/',
    '/data-insights/themes': '/theme/list/',
    '/data-insights/css-templates': '/csstemplatemodelview/list/',
    '/data-insights/annotation-layers': '/annotationlayer/list/',
    '/data-insights/security/users': '/users/',
    '/data-insights/security/roles': '/roles/',
    '/data-insights/security/groups': '/list_groups/',
    '/data-insights/action-log': '/actionlog/list',
    '/data-insights/extensions': '/extensions/list/',
  }
  return map[platformPath] ?? null
}
