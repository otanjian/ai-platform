import { Link, useLocation } from 'react-router-dom'
import { useMenu } from '../../hooks/useMenu.ts'
import { useState, useMemo, useEffect } from 'react'
import * as Icons from 'lucide-react'

export function Sidebar({ open }: { open: boolean }) {
  const { data: menu } = useMenu()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [collapsedByUser, setCollapsedByUser] = useState<Set<string>>(new Set())

  const activeCodes = useMemo(() => {
    const codes = new Set<string>()
    const walk = (items: typeof menu) => {
      if (!items) return
      for (const item of items) {
        if (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) {
          codes.add(item.code)
        }
        if (item.children) walk(item.children)
      }
    }
    walk(menu)
    return codes
  }, [menu, location.pathname])

  // Auto-expand ancestors of the active route, unless user collapsed them
  useEffect(() => {
    if (!menu) return
    setExpanded((prev) => {
      const next = new Set(prev)
      const walk = (items: NonNullable<typeof menu>, parents: string[] = []) => {
        for (const item of items) {
          const chain = [...parents, item.code]
          if (activeCodes.has(item.code)) {
            for (const code of parents) {
              if (!collapsedByUser.has(code)) next.add(code)
            }
          }
          if (item.children) walk(item.children, chain)
        }
      }
      walk(menu)
      return next
    })
  }, [menu, activeCodes, collapsedByUser])

  const toggleExpand = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
        setCollapsedByUser((c) => new Set(c).add(code))
      } else {
        next.add(code)
        setCollapsedByUser((c) => {
          const n = new Set(c)
          n.delete(code)
          return n
        })
      }
      return next
    })
  }

  return (
    <>
      {/* Mobile: always available hamburger when desktop sidebar may be hidden */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-sm lg:hidden"
      >
        {mobileOpen ? <Icons.X className="h-5 w-5" /> : <Icons.Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-200 ease-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${open ? 'w-64' : 'w-0 overflow-hidden border-r-0 lg:w-0'}`}
        aria-hidden={!open && !mobileOpen}
      >
        <div className="flex h-16 w-64 shrink-0 items-center border-b border-slate-200 px-6">
          <span className="truncate text-lg font-bold text-indigo-700">AI智造平台</span>
        </div>
        <nav className="w-64 flex-1 space-y-1 overflow-y-auto p-4">
          {menu?.map((item) => {
            const Icon = (Icons as any)[item.icon] || Icons.Circle
            const hasChildren = item.children && item.children.length > 0
            const isActive = activeCodes.has(item.code)
            const isExpanded = expanded.has(item.code)
            return (
              <div key={item.code}>
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.code)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </span>
                    {isExpanded ? (
                      <Icons.ChevronDown className="h-4 w-4" />
                    ) : (
                      <Icons.ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )}
                {hasChildren && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-2">
                    {item.children?.map((child) => {
                      const ChildIcon = (Icons as any)[child.icon] || Icons.Circle
                      const childActive = activeCodes.has(child.code)
                      return (
                        <Link
                          key={child.code}
                          to={child.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${
                            childActive
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <ChildIcon className="h-4 w-4" />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="w-64 border-t border-slate-200 p-4">
          <a
            href="/logout"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Icons.LogOut className="h-5 w-5" />
            退出登录
          </a>
        </div>
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
