import { useLocation } from 'react-router-dom'
import { useSession } from '../../hooks/useSession.ts'
import { useMenu } from '../../hooks/useMenu.ts'
import { formatMenuPath } from '../../lib/menuPath.ts'
import { User, PanelLeftClose, PanelLeft } from 'lucide-react'

export function TopBar({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}) {
  const location = useLocation()
  const { data: session } = useSession()
  const { data: menu } = useMenu()
  const menuPath = formatMenuPath(menu, location.pathname)

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          title={sidebarOpen ? '隐藏菜单' : '显示菜单'}
          aria-label={sidebarOpen ? '隐藏菜单' : '显示菜单'}
          aria-pressed={sidebarOpen}
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
        {menuPath && (
          <span className="text-sm text-slate-600">{menuPath}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <User className="h-5 w-5 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          {session?.username || 'Unknown'}
        </span>
      </div>
    </header>
  )
}
