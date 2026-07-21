import { describe, expect, it } from 'vitest'
import {
  SIDEBAR_LG_MIN_WIDTH,
  isDesktopSidebarViewport,
  shouldCloseMobileDrawerAfterNav,
  platformSettingsPathToConsolePath,
  platformKnowledgePathToDatasetsUrl,
  platformWorkspacePathToBuildingAiUrl,
  platformTaskHubPathToTaskViewPath,
  platformDataInsightsPathToSupersetPath,
} from './sidebarNav.ts'

describe('isDesktopSidebarViewport', () => {
  it('is desktop at lg and above', () => {
    expect(isDesktopSidebarViewport(SIDEBAR_LG_MIN_WIDTH)).toBe(true)
    expect(isDesktopSidebarViewport(1440)).toBe(true)
  })

  it('is not desktop below lg', () => {
    expect(isDesktopSidebarViewport(SIDEBAR_LG_MIN_WIDTH - 1)).toBe(false)
  })
})

describe('shouldCloseMobileDrawerAfterNav', () => {
  it('closes drawer only below lg', () => {
    expect(shouldCloseMobileDrawerAfterNav(1023)).toBe(true)
    expect(shouldCloseMobileDrawerAfterNav(1024)).toBe(false)
  })
})

describe('platformSettingsPathToConsolePath', () => {
  it('maps settings leaves to console paths', () => {
    expect(platformSettingsPathToConsolePath('/ai-brain/settings/dashboard')).toBe(
      '/console/dashboard',
    )
    expect(platformSettingsPathToConsolePath('/ai-brain/settings/user/list')).toBe(
      '/console/user/list',
    )
  })

  it('rejects non-settings paths', () => {
    expect(platformSettingsPathToConsolePath('/ai-brain/agents')).toBeNull()
    expect(platformSettingsPathToConsolePath('/ai-brain/settings')).toBeNull()
  })
})

describe('platformKnowledgePathToDatasetsUrl', () => {
  it('maps knowledge leaves to datasets urls', () => {
    expect(platformKnowledgePathToDatasetsUrl('/ai-brain/knowledge/plaza')).toBe('/datasets')
    expect(platformKnowledgePathToDatasetsUrl('/ai-brain/knowledge/mine')).toBe(
      '/datasets?scope=mine',
    )
    expect(platformKnowledgePathToDatasetsUrl('/ai-brain/knowledge/create')).toBe(
      '/datasets?create=1',
    )
  })
})

describe('platformWorkspacePathToBuildingAiUrl', () => {
  it('maps workspace leaves to BuildingAI urls', () => {
    expect(platformWorkspacePathToBuildingAiUrl('/ai-brain/chat')).toBe('/')
    expect(platformWorkspacePathToBuildingAiUrl('/ai-brain/apps')).toBe('/apps')
    expect(platformWorkspacePathToBuildingAiUrl('/ai-brain/history')).toBe('/?_history=1')
  })
})

describe('platformTaskHubPathToTaskViewPath', () => {
  it('maps each leaf to a distinct embed view', () => {
    expect(platformTaskHubPathToTaskViewPath('/task-hub/inbox')).toBe('/?_tv=inbox&_embed=1')
    expect(platformTaskHubPathToTaskViewPath('/task-hub/kanban')).toBe('/?_tv=kanban&_embed=1')
    expect(platformTaskHubPathToTaskViewPath('/task-hub/settings')).toBe('/?_tv=settings&_embed=1')
    expect(platformTaskHubPathToTaskViewPath('/task-hub/analytics')).toBe('/?_tv=analytics&_embed=1')
  })

  it('rejects unknown paths', () => {
    expect(platformTaskHubPathToTaskViewPath('/task-hub/unknown')).toBeNull()
  })
})

describe('platformDataInsightsPathToSupersetPath', () => {
  it('maps Superset mirror leaves', () => {
    expect(platformDataInsightsPathToSupersetPath('/data-insights/dashboards')).toBe(
      '/dashboard/list/',
    )
    expect(platformDataInsightsPathToSupersetPath('/data-insights/sqllab')).toBe('/sqllab/')
    expect(platformDataInsightsPathToSupersetPath('/data-insights/security/users')).toBe('/users/')
  })

  it('rejects obsolete non-Superset data-insights paths', () => {
    expect(platformDataInsightsPathToSupersetPath('/data-insights/smart-qa')).toBeNull()
    expect(platformDataInsightsPathToSupersetPath('/data-insights/orgs')).toBeNull()
  })
})
