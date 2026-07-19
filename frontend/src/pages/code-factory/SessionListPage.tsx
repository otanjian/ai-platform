import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FolderGit2,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'
import {
  filterSessionOverview,
  groupSessionCountsByProject,
  type SessionOverviewItem,
} from '../../lib/session-overview.ts'

export function SessionListPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionOverviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [projectId, setProjectId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/sessions')
      setSessions(res.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.error || '加载会话历史失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () => filterSessionOverview(sessions, { projectId, query }),
    [sessions, projectId, query]
  )
  const groups = useMemo(() => groupSessionCountsByProject(sessions), [sessions])

  const openSession = (row: SessionOverviewItem) => {
    navigate(`/code-factory/chat?projectId=${row.projectId}&sessionId=${encodeURIComponent(row.sessionId)}`)
  }

  const deleteSession = async (row: SessionOverviewItem) => {
    const label = row.title || row.sessionId
    if (!window.confirm(`确定删除会话「${label}」？\n删除后将从本平台列表移除。`)) return

    setDeletingId(row.sessionId)
    setError('')
    try {
      await api.delete(`/projects/${row.projectId}/sessions/${encodeURIComponent(row.sessionId)}`)
      setSessions((prev) => prev.filter((s) => s.sessionId !== row.sessionId))
    } catch (err: any) {
      setError(err?.response?.data?.error || '删除会话失败')
    } finally {
      setDeletingId(null)
    }
  }

  const formatTime = (value?: string | null) => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">会话历史</h2>
          <p className="text-sm text-slate-500">跨项目查看你的 AI 编程会话，打开后进入嵌入对话。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索标题或会话 ID"
              className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            刷新
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex min-h-[28rem] gap-4">
        <aside className="w-56 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-800">按项目筛选</div>
          <div className="p-2">
            <button
              type="button"
              onClick={() => setProjectId(null)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                projectId == null ? 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>全部项目</span>
              <span className="text-xs text-slate-500">{groups.all}</span>
            </button>
            <ul className="mt-1 space-y-0.5">
              {groups.byProject.map((g) => (
                <li key={g.projectId}>
                  <button
                    type="button"
                    onClick={() => setProjectId(g.projectId)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                      projectId === g.projectId
                        ? 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{g.projectName}</span>
                    <span className="shrink-0 text-xs text-slate-500">{g.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <Card className="min-w-0 flex-1 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">加载会话中...</p>
            ) : sessions.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-600">暂无会话历史</p>
                <p className="mt-1 text-xs text-slate-500">在「AI 编程会话」中打开项目后，会话会出现在这里。</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/code-factory/chat"
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    去 AI 编程会话
                  </Link>
                  <Link
                    to="/code-factory/project-init"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    项目初始化
                  </Link>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">没有匹配的会话，试试调整筛选或搜索。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                      <th className="px-4 py-3 font-medium">标题</th>
                      <th className="px-4 py-3 font-medium">项目</th>
                      <th className="px-4 py-3 font-medium">更新时间</th>
                      <th className="px-4 py-3 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const busy = deletingId === row.sessionId
                      return (
                        <tr key={row.sessionId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{row.title || '未命名会话'}</div>
                            <div className="mt-0.5 font-mono text-xs text-slate-400">{row.sessionId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-slate-700">
                              <FolderGit2 className="h-3.5 w-3.5 text-slate-400" />
                              {row.projectName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatTime(row.updatedAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openSession(row)}
                                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                打开
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => deleteSession(row)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                title="删除"
                              >
                                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
