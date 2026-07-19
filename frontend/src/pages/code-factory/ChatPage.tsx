import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FolderGit2,
  MessagesSquare,
  Users,
  Loader2,
  Plus,
  MessageSquare,
  FolderOpen,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Trash2,
} from 'lucide-react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'

type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'

interface AssignedProject {
  id: number
  name: string
  description?: string | null
  projectPath: string
  status: string
  memberCount: number
  myRole?: ProjectRole | null
}

interface OpenChatResult {
  sessionId: string
  projectId: number
  title?: string | null
  created: boolean
  embedUrl: string
}

interface ProjectSession {
  id: number
  sessionId: string
  projectId: number
  title?: string | null
  directory?: string | null
  status: string
  createdAt?: string
  updatedAt?: string
  embedUrl: string
}

const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: '所有者',
  admin: '管理员',
  member: '成员',
  viewer: '观察者',
}

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState<AssignedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openingId, setOpeningId] = useState<number | null>(null)
  const openedDeepLinkKeyRef = useRef<string | null>(null)
  const [active, setActive] = useState<{
    project: AssignedProject
    session: OpenChatResult
  } | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const [sessions, setSessions] = useState<ProjectSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  /** Visually hide OpenCode right review/files pane (no OpenCode code changes) */
  const [reviewPaneOpen, setReviewPaneOpen] = useState(true)
  // Approximate share of iframe width taken by the right review panel when open
  const REVIEW_PANE_RATIO = 0.42

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/projects', { params: { status: 'active' } })
        if (!cancelled) setProjects(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error || '加载项目失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const loadSessions = useCallback(async (projectId: number) => {
    setSessionsLoading(true)
    try {
      const res = await api.get(`/projects/${projectId}/sessions`)
      setSessions(res.data || [])
      return (res.data || []) as ProjectSession[]
    } catch (err: any) {
      setError(err?.response?.data?.error || '加载会话列表失败')
      return [] as ProjectSession[]
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  // Deep-link: /code-factory/chat?projectId=&sessionId=
  useEffect(() => {
    if (loading || active) return
    const projectIdRaw = searchParams.get('projectId')
    const sessionId = searchParams.get('sessionId')
    if (!projectIdRaw) return

    const projectId = Number(projectIdRaw)
    if (!Number.isFinite(projectId)) {
      setError('无效的项目参数')
      return
    }
    if (projects.length === 0) return

    const linkKey = `${projectId}:${sessionId || ''}`
    if (openedDeepLinkKeyRef.current === linkKey) return

    let cancelled = false
    const run = async () => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) {
        setError('未找到该项目，或你没有访问权限')
        return
      }

      setOpeningId(projectId)
      setError('')
      try {
        if (sessionId) {
          const list = await loadSessions(projectId)
          if (cancelled) return
          const row = list.find((s) => s.sessionId === sessionId)
          if (row) {
            openedDeepLinkKeyRef.current = linkKey
            setActive({
              project,
              session: {
                sessionId: row.sessionId,
                projectId: row.projectId,
                title: row.title,
                created: false,
                embedUrl: row.embedUrl,
              },
            })
            setListOpen(true)
            return
          }
          setError('会话不存在或已删除，已尝试打开项目默认会话')
        }

        const res = await api.post(`/projects/${projectId}/open-chat`)
        if (cancelled) return
        const session = res.data as OpenChatResult
        openedDeepLinkKeyRef.current = linkKey
        setActive({ project, session })
        setListOpen(true)
        setSearchParams({ projectId: String(projectId), sessionId: session.sessionId })
        await loadSessions(projectId)
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error || '打开会话失败')
      } finally {
        if (!cancelled) setOpeningId(null)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [loading, active, searchParams, projects, loadSessions, setSearchParams])

  const openProject = async (project: AssignedProject) => {
    setOpeningId(project.id)
    setError('')
    try {
      const res = await api.post(`/projects/${project.id}/open-chat`)
      const session = res.data as OpenChatResult
      setActive({ project, session })
      setListOpen(true)
      setSearchParams({ projectId: String(project.id), sessionId: session.sessionId })
      await loadSessions(project.id)
    } catch (err: any) {
      setError(err?.response?.data?.error || '打开会话失败')
    } finally {
      setOpeningId(null)
    }
  }

  const toggleSessionList = async () => {
    if (!active) return
    const next = !listOpen
    setListOpen(next)
    if (next) await loadSessions(active.project.id)
  }

  const selectSession = (row: ProjectSession) => {
    if (!active) return
    // Keep the session sidebar open while switching embeds
    setListOpen(true)
    setActive({
      project: active.project,
      session: {
        sessionId: row.sessionId,
        projectId: row.projectId,
        title: row.title,
        created: false,
        embedUrl: row.embedUrl,
      },
    })
    setSearchParams({ projectId: String(active.project.id), sessionId: row.sessionId })
  }

  const createSession = async () => {
    if (!active) return
    setCreating(true)
    setError('')
    try {
      const res = await api.post(`/projects/${active.project.id}/sessions`)
      const session = res.data as OpenChatResult
      setListOpen(true)
      setActive({ project: active.project, session })
      setSearchParams({ projectId: String(active.project.id), sessionId: session.sessionId })
      await loadSessions(active.project.id)
    } catch (err: any) {
      setError(err?.response?.data?.error || '新建会话失败')
    } finally {
      setCreating(false)
    }
  }

  const deleteSession = async (row: ProjectSession) => {
    if (!active) return
    const label = row.title || row.sessionId
    if (!window.confirm(`确定删除会话「${label}」？\n删除后将从本平台列表移除。`)) return

    setDeletingId(row.sessionId)
    setError('')
    try {
      await api.delete(`/projects/${active.project.id}/sessions/${encodeURIComponent(row.sessionId)}`)
      const remaining = sessions.filter((s) => s.sessionId !== row.sessionId)
      setSessions(remaining)

      if (active.session.sessionId === row.sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0])
        } else {
          // No sessions left — create a fresh one so the embed stays usable
          const res = await api.post(`/projects/${active.project.id}/sessions`)
          const session = res.data as OpenChatResult
          setActive({ project: active.project, session })
          setSearchParams({ projectId: String(active.project.id), sessionId: session.sessionId })
          await loadSessions(active.project.id)
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || '删除会话失败')
    } finally {
      setDeletingId(null)
    }
  }

  const backToProjects = () => {
    setActive(null)
    setListOpen(false)
    setSessions([])
    openedDeepLinkKeyRef.current = null
    setSearchParams({})
  }

  if (active) {
    return (
      <div className="flex h-[calc(100vh-7rem)] flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={toggleSessionList}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition ${
                listOpen
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={listOpen ? '收起会话列表' : '展开会话列表'}
            >
              {listOpen ? <PanelLeftClose className="h-4 w-4" /> : <MessagesSquare className="h-4 w-4" />}
              会话列表
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">{active.project.name}</h2>
              <p className="truncate text-xs text-slate-500">
                {active.session.title || active.session.sessionId}
                {' · '}
                会话 ID：{active.session.sessionId}
                {active.session.created ? ' · 新建' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={backToProjects}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <FolderOpen className="h-4 w-4" />
            切换项目
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex min-h-0 flex-1 gap-3">
          {listOpen && (
            <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                <div className="text-sm font-medium text-slate-800">我的会话</div>
                <button
                  type="button"
                  onClick={createSession}
                  disabled={creating}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  新建会话
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {sessionsLoading ? (
                  <p className="px-2 py-4 text-center text-xs text-slate-500">加载中...</p>
                ) : sessions.length === 0 ? (
                  <div className="px-2 py-8 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs text-slate-500">暂无会话，点击上方新建</p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {sessions.map((row) => {
                      const selected = row.sessionId === active.session.sessionId
                      const busy = deletingId === row.sessionId
                      return (
                        <li key={row.sessionId}>
                          <div
                            className={`group flex items-start gap-1 rounded-lg pr-1 transition ${
                              selected
                                ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => selectSession(row)}
                              disabled={busy}
                              className="min-w-0 flex-1 px-3 py-2.5 text-left disabled:opacity-60"
                            >
                              <div className="truncate text-sm font-medium">
                                {row.title || '未命名会话'}
                              </div>
                              <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                                {row.sessionId}
                              </div>
                            </button>
                            <button
                              type="button"
                              title="删除会话"
                              aria-label={`删除会话 ${row.title || row.sessionId}`}
                              disabled={busy || deletingId !== null}
                              onClick={(e) => {
                                e.stopPropagation()
                                void deleteSession(row)
                              }}
                              className="mt-2 mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100 disabled:cursor-wait disabled:opacity-40"
                            >
                              {busy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </aside>
          )}

          <Card className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <CardContent className="relative h-full overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setReviewPaneOpen((v) => !v)}
                className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-slate-600 shadow-sm backdrop-blur hover:bg-slate-50 hover:text-slate-900"
                title={reviewPaneOpen ? '隐藏文件变更' : '显示文件变更'}
                aria-label={reviewPaneOpen ? '隐藏文件变更' : '显示文件变更'}
                aria-pressed={reviewPaneOpen}
              >
                {reviewPaneOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
              </button>
              {/* Crop OpenCode top titlebar; optionally clip right review pane */}
              <iframe
                key={active.session.sessionId}
                src={active.session.embedUrl}
                className="absolute left-0 border-0"
                style={{
                  top: -36,
                  height: 'calc(100% + 36px)',
                  width: reviewPaneOpen ? '100%' : `${(100 / (1 - REVIEW_PANE_RATIO)).toFixed(2)}%`,
                }}
                title={`${active.project.name} OpenCode Session`}
                allow="clipboard-read; clipboard-write"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">AI 编程会话</h2>
        <p className="text-sm text-slate-500">选择已分配给你的项目，打开或创建对应 OpenCode 会话。</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">加载项目中...</p>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FolderGit2 className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">暂无已分配项目，请先在「项目初始化」中创建或加入项目。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const busy = openingId === project.id
            return (
              <button
                key={project.id}
                type="button"
                disabled={busy || openingId !== null}
                onClick={() => openProject(project)}
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md disabled:cursor-wait disabled:opacity-70"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <FolderGit2 className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-slate-900">{project.name}</div>
                    <div className="mt-1 truncate font-mono text-xs text-slate-500">{project.projectPath}</div>
                    {project.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {project.memberCount} 人
                      </span>
                      {project.myRole && <span>角色：{ROLE_LABELS[project.myRole]}</span>}
                      <span>状态：活跃</span>
                    </div>
                    {busy && <p className="mt-2 text-xs text-indigo-600">正在打开会话...</p>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
