export interface SessionOverviewItem {
  id: number
  sessionId: string
  projectId: number
  projectName: string
  title?: string | null
  directory?: string | null
  status: string
  createdAt?: string | null
  updatedAt?: string | null
  embedUrl: string
}

export function filterSessionOverview(
  items: SessionOverviewItem[],
  opts: { projectId?: number | null; query?: string }
): SessionOverviewItem[] {
  const q = opts.query?.trim().toLowerCase() || ''
  return items.filter((item) => {
    if (opts.projectId != null && item.projectId !== opts.projectId) return false
    if (!q) return true
    const title = (item.title || '').toLowerCase()
    const sid = item.sessionId.toLowerCase()
    return title.includes(q) || sid.includes(q)
  })
}

export function groupSessionCountsByProject(items: SessionOverviewItem[]): {
  all: number
  byProject: Array<{ projectId: number; projectName: string; count: number }>
} {
  const map = new Map<number, { projectId: number; projectName: string; count: number }>()
  for (const item of items) {
    const existing = map.get(item.projectId)
    if (existing) {
      existing.count += 1
    } else {
      map.set(item.projectId, {
        projectId: item.projectId,
        projectName: item.projectName,
        count: 1,
      })
    }
  }
  const byProject = [...map.values()].sort((a, b) => a.projectName.localeCompare(b.projectName, 'zh-CN'))
  return { all: items.length, byProject }
}
