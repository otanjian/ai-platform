import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileDiff, Loader2, RefreshCw } from 'lucide-react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'
import {
  fileLabel,
  parsePatchLines,
  statusLabel,
  type DiffFile,
} from '../../lib/diff-view.ts'

interface AssignedProject {
  id: number
  name: string
}

interface ProjectSession {
  sessionId: string
  title?: string | null
}

export function DiffPage() {
  const [projects, setProjects] = useState<AssignedProject[]>([])
  const [sessions, setSessions] = useState<ProjectSession[]>([])
  const [projectId, setProjectId] = useState<number | ''>('')
  const [sessionId, setSessionId] = useState('')
  const [files, setFiles] = useState<DiffFile[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingDiff, setLoadingDiff] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get('/projects', { params: { status: 'active' } })
        if (!cancelled) setProjects(res.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error || '加载项目失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadSessions = useCallback(async (id: number) => {
    try {
      const res = await api.get(`/projects/${id}/sessions`)
      const list: ProjectSession[] = res.data || []
      setSessions(list)
      setSessionId(list[0]?.sessionId || '')
    } catch {
      setSessions([])
      setSessionId('')
    }
  }, [])

  useEffect(() => {
    setFiles([])
    setActiveIdx(0)
    if (typeof projectId === 'number') {
      loadSessions(projectId)
    } else {
      setSessions([])
      setSessionId('')
    }
  }, [projectId, loadSessions])

  const loadDiff = useCallback(async () => {
    if (typeof projectId !== 'number' || !sessionId) return
    setLoadingDiff(true)
    setError('')
    try {
      const res = await api.get(`/projects/${projectId}/sessions/${encodeURIComponent(sessionId)}/diff`)
      const list: DiffFile[] = res.data?.files || []
      setFiles(list)
      setActiveIdx(0)
    } catch (err: any) {
      setFiles([])
      setError(err?.response?.data?.error || '加载 Diff 失败')
    } finally {
      setLoadingDiff(false)
    }
  }, [projectId, sessionId])

  useEffect(() => {
    if (typeof projectId === 'number' && sessionId) {
      loadDiff()
    }
  }, [projectId, sessionId, loadDiff])

  const active = files[activeIdx]
  const lines = useMemo(() => parsePatchLines(active?.patch), [active])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">变更 Diff</h2>
          <p className="text-sm text-slate-500">查看本人会话中 agent 产生的文件变更。</p>
        </div>
        <button
          type="button"
          onClick={loadDiff}
          disabled={loadingDiff || typeof projectId !== 'number' || !sessionId}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {loadingDiff ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          刷新
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardContent className="grid gap-3 pt-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">项目</span>
            <select
              value={projectId === '' ? '' : String(projectId)}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : '')}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">选择项目…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">会话</span>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled={typeof projectId !== 'number' || sessions.length === 0}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            >
              {sessions.length === 0 ? (
                <option value="">暂无会话</option>
              ) : (
                sessions.map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>
                    {s.title || s.sessionId}
                  </option>
                ))
              )}
            </select>
          </label>
        </CardContent>
      </Card>

      {typeof projectId === 'number' && !sessionId && !loadingDiff && (
        <p className="text-sm text-slate-500">该项目下暂无会话，请先在「AI 编程会话」中创建。</p>
      )}

      {typeof projectId === 'number' && sessionId && !loadingDiff && files.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
          <FileDiff className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">当前会话没有 agent 文件变更。</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex min-h-[28rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-100">
            <div className="border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-800">
              文件 ({files.length})
            </div>
            <ul className="p-2">
              {files.map((f, i) => (
                <li key={`${fileLabel(f, i)}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`mb-1 w-full rounded-lg px-2.5 py-2 text-left text-sm transition ${
                      i === activeIdx
                        ? 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate font-medium">{fileLabel(f, i)}</div>
                    <div className="mt-0.5 flex gap-2 text-xs text-slate-500">
                      <span>{statusLabel(f.status)}</span>
                      <span className="text-emerald-600">+{f.additions || 0}</span>
                      <span className="text-rose-600">-{f.deletions || 0}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="min-w-0 flex-1 overflow-auto">
            <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-medium text-slate-800">
              {active ? fileLabel(active, activeIdx) : '选择文件'}
            </div>
            <pre className="p-0 text-xs leading-5">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.kind === 'add'
                      ? 'bg-emerald-50 text-emerald-900'
                      : line.kind === 'del'
                        ? 'bg-rose-50 text-rose-900'
                        : line.kind === 'hunk'
                          ? 'bg-sky-50 text-sky-800'
                          : 'text-slate-700'
                  }
                >
                  <span className="block whitespace-pre-wrap px-4 py-0.5">{line.text || ' '}</span>
                </div>
              ))}
              {active && lines.length === 0 && (
                <p className="px-4 py-6 text-sm text-slate-400">该文件无 patch 内容。</p>
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
