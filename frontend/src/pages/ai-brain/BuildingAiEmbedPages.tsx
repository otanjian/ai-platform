import { useEffect, useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { api } from '../../lib/api.ts'
import {
  platformKnowledgePathToDatasetsUrl,
  platformSettingsPathToConsolePath,
  platformWorkspacePathToBuildingAiUrl,
} from '../../lib/sidebarNav.ts'

/** BuildingAI web UI (Vite client). */
const BUILDINGAI_UI_FALLBACK = 'http://127.0.0.1:4091'

type EmbedSession = {
  ok: boolean
  token?: string
  embedTokenParam?: string
  uiBaseUrl?: string
  error?: string
}

function buildEmbedUrl(
  base: string,
  pathWithOptionalQuery: string,
  token?: string,
  shellEmbed?: boolean,
) {
  const pathNorm = pathWithOptionalQuery.startsWith('/')
    ? pathWithOptionalQuery
    : `/${pathWithOptionalQuery}`
  const [pathname, search = ''] = pathNorm.split('?')
  const resolved = new URL(`${base.replace(/\/$/, '')}${pathname}`)
  if (search) {
    new URLSearchParams(search).forEach((v, k) => resolved.searchParams.set(k, v))
  }
  if (token) resolved.searchParams.set('_t', token)
  if (shellEmbed) resolved.searchParams.set('_embed', '1')
  // Bust iframe document cache so BuildingAI layout CSS/JS updates are visible after refresh.
  resolved.searchParams.set('_v', 'chat-fullwidth-1')
  return resolved.toString()
}

export function BuildingAiEmbedPage({
  path,
  title,
  shellEmbed = false,
}: {
  path: string
  title: string
  /** Hide BuildingAI chrome (default sidebar / datasets sidebar / console shell). */
  shellEmbed?: boolean
}) {
  const [src, setSrc] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await api.get('/agent/embed-session')
        const data = res.data as EmbedSession
        if (cancelled) return
        const base = (data.uiBaseUrl || BUILDINGAI_UI_FALLBACK).replace(/\/$/, '')
        if (data.ok && data.embedTokenParam) {
          setSrc(buildEmbedUrl(base, path, data.embedTokenParam, shellEmbed))
          setWarning(null)
        } else {
          setSrc(buildEmbedUrl(BUILDINGAI_UI_FALLBACK, path, undefined, shellEmbed))
          setWarning(data.error || 'BuildingAI 自动登录失败，请在嵌入页手动登录')
        }
      } catch (err: unknown) {
        if (cancelled) return
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'BuildingAI 自动登录失败，请在嵌入页手动登录'
        setSrc(buildEmbedUrl(BUILDINGAI_UI_FALLBACK, path, undefined, shellEmbed))
        setWarning(msg)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [path, shellEmbed])

  return (
    <div className="relative -m-4 h-[calc(100vh-4rem)] overflow-hidden lg:-m-6">
      {warning && (
        <div className="absolute left-0 right-0 top-0 z-10 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          {warning}
        </div>
      )}
      {src ? (
        <iframe
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          title={title}
          allow="clipboard-read; clipboard-write"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          正在准备 BuildingAI 登录…
        </div>
      )}
    </div>
  )
}

export function AgentsEmbedPage() {
  return <BuildingAiEmbedPage path="/agents" title="智能体" shellEmbed />
}

export function WorkspaceSectionEmbedPage() {
  const { pathname } = useLocation()
  const buildingAiUrl = platformWorkspacePathToBuildingAiUrl(pathname)
  if (!buildingAiUrl) {
    return <Navigate to="/ai-brain/chat" replace />
  }
  const title =
    pathname === '/ai-brain/apps'
      ? 'AI 应用'
      : pathname === '/ai-brain/history'
        ? '历史记录'
        : '对话'
  return <BuildingAiEmbedPage path={buildingAiUrl} title={title} shellEmbed />
}

export function KnowledgeSectionEmbedPage() {
  const { pathname } = useLocation()
  const datasetsUrl = platformKnowledgePathToDatasetsUrl(pathname)
  if (!datasetsUrl) {
    return <Navigate to="/ai-brain/knowledge/plaza" replace />
  }
  return <BuildingAiEmbedPage path={datasetsUrl} title="知识库" shellEmbed />
}

/** Settings leaf → BuildingAI /console/... without console shell. */
export function SettingsConsoleEmbedPage() {
  const { pathname } = useLocation()
  const consolePath = platformSettingsPathToConsolePath(pathname)
  if (!consolePath) {
    return <Navigate to="/ai-brain/settings/dashboard" replace />
  }
  return <BuildingAiEmbedPage path={consolePath} title="智能体设置" shellEmbed />
}
