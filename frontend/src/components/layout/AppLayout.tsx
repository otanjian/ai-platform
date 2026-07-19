import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar.tsx'
import { TopBar } from './TopBar.tsx'

const SIDEBAR_STORAGE_KEY = 'aiplatform.sidebarOpen'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== '0'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarOpen ? '1' : '0')
    } catch {
      // ignore
    }
  }, [sidebarOpen])

  const toggleSidebar = () => setSidebarOpen((v) => !v)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
