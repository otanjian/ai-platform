import { useEffect, useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { api } from '../../lib/api.ts'
import { platformTaskHubPathToTaskViewPath } from '../../lib/sidebarNav.ts'

type EmbedSession = {
  ok: boolean
  embedTokenParam?: string
  embedRefreshParam?: string
  uiBaseUrl?: string
  error?: string
}

function buildEmbedUrl(
  base: string,
  path: string,
  tokenParam: string,
  refreshParam?: string,
) {
  const pathNorm = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base.replace(/\/$/, '')}${pathNorm}`)
  url.searchParams.set('_t', tokenParam)
  if (refreshParam) url.searchParams.set('_r', refreshParam)
  return url.toString()
}

/** Hard-gate TaskView iframe: no credential-less fallback. */
export function TaskHubEmbedPage() {
  const { pathname } = useLocation()
  const taskViewPath = platformTaskHubPathToTaskViewPath(pathname)
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!taskViewPath) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get('/taskview/embed-session')
        const data = res.data as EmbedSession
        if (cancelled) return
        if (!data.ok || !data.embedTokenParam || !data.uiBaseUrl) {
          setSrc(null)
          setError(data.error || 'TaskView SSO 失败（硬门禁）')
          return
        }
        setSrc(buildEmbedUrl(data.uiBaseUrl, taskViewPath, data.embedTokenParam, data.embedRefreshParam))
        setError(null)
      } catch (err: unknown) {
        if (cancelled) return
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'TaskView SSO 失败（硬门禁）'
        setSrc(null)
        setError(msg)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [taskViewPath])

  if (!taskViewPath) {
    return <Navigate to="/task-hub/inbox" replace />
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium text-red-700">待办中心不可用</p>
        <p className="max-w-md text-xs text-slate-600">{error}</p>
        <p className="text-xs text-slate-400">请确认 TaskView 已启动且用户已同步，然后重试。</p>
      </div>
    )
  }

  return (
    <div className="relative -m-4 h-[calc(100vh-4rem)] overflow-hidden lg:-m-6">
      {src ? (
        <iframe
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          title="待办中心"
          allow="clipboard-read; clipboard-write"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          正在准备 TaskView 登录…
        </div>
      )}
    </div>
  )
}
