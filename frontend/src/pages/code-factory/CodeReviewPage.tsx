import { useCallback, useEffect, useState } from 'react'
import { GitPullRequest, Loader2, Play } from 'lucide-react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'
import { riskChipMeta } from '../../lib/risk-labels.ts'

interface AssignedProject {
  id: number
  name: string
  projectPath: string
  status: string
}

interface ProjectSession {
  sessionId: string
  title?: string | null
}

interface ReviewResult {
  sessionId: string
  text: string
  risks: string[]
}

export function CodeReviewPage() {
  const [projects, setProjects] = useState<AssignedProject[]>([])
  const [sessions, setSessions] = useState<ProjectSession[]>([])
  const [projectId, setProjectId] = useState<number | ''>('')
  const [sessionId, setSessionId] = useState('')
  const [args, setArgs] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
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
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadSessions = useCallback(async (id: number) => {
    try {
      const res = await api.get(`/projects/${id}/sessions`)
      setSessions(res.data || [])
    } catch {
      setSessions([])
    }
  }, [])

  useEffect(() => {
    setSessionId('')
    setResult(null)
    if (typeof projectId === 'number') {
      loadSessions(projectId)
    } else {
      setSessions([])
    }
  }, [projectId, loadSessions])

  const runReview = async () => {
    if (typeof projectId !== 'number') {
      setError('请先选择项目')
      return
    }
    setRunning(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post(`/projects/${projectId}/review`, {
        sessionId: sessionId || undefined,
        arguments: args.trim() || undefined,
      })
      setResult(res.data)
      if (res.data?.sessionId && !sessionId) setSessionId(res.data.sessionId)
    } catch (err: any) {
      setError(err?.response?.data?.error || '代码审查失败')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">代码审查</h2>
          <p className="text-sm text-slate-500">
            调用 OpenCode <code className="rounded bg-slate-100 px-1">review</code> 审查工作区 diff、分支或
            PR。
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="grid gap-3 md:grid-cols-3">
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
              <span className="mb-1 block text-slate-600">会话（可选）</span>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                disabled={typeof projectId !== 'number'}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              >
                <option value="">自动使用/创建会话</option>
                {sessions.map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>
                    {s.title || s.sessionId}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">审查参数（可选）</span>
              <input
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                placeholder="留空=未提交变更；或填分支 / PR"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={runReview}
            disabled={running || typeof projectId !== 'number'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            开始审查
          </button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-3 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-slate-800">审查结果</span>
              <span className="text-xs text-slate-400">会话 {result.sessionId}</span>
              {result.risks?.map((risk) => {
                const meta = riskChipMeta(risk)
                return (
                  <span
                    key={risk}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                )
              })}
            </div>
            {result.text ? (
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                {result.text}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">审查已完成，但未返回文本内容。</p>
            )}
          </CardContent>
        </Card>
      )}

      {!result && !running && !error && (
        <p className="text-sm text-slate-400">选择项目后开始审查。无变更时会提示「没有可审查的 diff」。</p>
      )}
    </div>
  )
}
