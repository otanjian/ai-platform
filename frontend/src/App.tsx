import { Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from './hooks/useSession.ts'
import { AppLayout } from './components/layout/AppLayout.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { TaskHubPage } from './pages/TaskHubPage.tsx'
import { CodeFactoryPage } from './pages/CodeFactoryPage.tsx'
import { DataInsightsPage } from './pages/DataInsightsPage.tsx'
import { AIBrainPage } from './pages/AIBrainPage.tsx'
import { SmartPipelinePage } from './pages/SmartPipelinePage.tsx'
import { SystemSettingsPage } from './pages/SystemSettingsPage.tsx'

function App() {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!session?.authenticated) {
    window.location.href = '/login'
    return null
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/task-hub/*" element={<TaskHubPage />} />
        <Route path="/code-factory/*" element={<CodeFactoryPage />} />
        <Route path="/data-insights/*" element={<DataInsightsPage />} />
        <Route path="/ai-brain/*" element={<AIBrainPage />} />
        <Route path="/smart-pipeline/*" element={<SmartPipelinePage />} />
        <Route path="/system-settings/*" element={<SystemSettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
