import { useState, useEffect } from 'react'
import { useSession } from '../hooks/useSession.ts'
import { useHealth } from '../hooks/useHealth.ts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx'
import { BarChart3, Brain, Workflow, Search, X } from 'lucide-react'

export function DashboardPage() {
  const { data: session } = useSession()
  const { data: health } = useHealth()
  const [commandOpen, setCommandOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setCommandOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const shortcuts = [
    { label: '数据洞察', icon: BarChart3, path: '/data-insights', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'AI大脑', icon: Brain, path: '/ai-brain', color: 'bg-violet-100 text-violet-700' },
    { label: '智能流水线', icon: Workflow, path: '/smart-pipeline', color: 'bg-amber-100 text-amber-700' },
  ]

  const metrics = [
    { label: '活跃会话', value: '12', trend: '+2' },
    { label: '今日查询', value: '1,248', trend: '+15%' },
    { label: '流水线执行', value: '86', trend: '+5' },
    { label: '健康服务', value: '6/6', trend: '正常' },
  ]

  const allModules = [
    { name: '代码工场', path: '/code-factory' },
    { name: '数据洞察', path: '/data-insights' },
    { name: 'AI大脑', path: '/ai-brain' },
    { name: '智能流水线', path: '/smart-pipeline' },
    { name: '系统管理', path: '/system-settings' },
  ]

  const filteredModules = allModules.filter((m) => m.name.includes(search))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">欢迎回来，{session?.username}</h1>
          <p className="text-sm text-slate-500">这是企业AI智造平台的统一工作台</p>
        </div>
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <Search className="h-4 w-4" />
          全局搜索
          <kbd className="rounded bg-slate-100 px-2 py-0.5 text-xs">⌘K</kbd>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{item.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-xs font-medium text-emerald-600">{item.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {shortcuts.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className={`rounded-lg p-3 ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900">{item.label}</span>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>服务健康状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health &&
                Object.entries(health).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{key}</span>
                    <span className={`text-sm font-medium ${value === 'ok' || value === 'connected' || value === 'online' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                系统初始化完成
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Keycloak realm 导入成功
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                等待子系统接入
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-32">
          <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索菜单、功能..."
                className="flex-1 text-sm outline-none"
              />
              <button onClick={() => setCommandOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="mt-2 max-h-60 overflow-auto">
              {filteredModules.length === 0 && <p className="p-2 text-sm text-slate-500">无结果</p>}
              {filteredModules.map((m) => (
                <a
                  key={m.path}
                  href={m.path}
                  onClick={() => setCommandOpen(false)}
                  className="block rounded-lg p-2 text-sm hover:bg-slate-100"
                >
                  {m.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
