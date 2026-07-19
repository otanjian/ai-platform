import { Routes, Route } from 'react-router-dom'
import { ChatPage } from './code-factory/ChatPage.tsx'
import { SessionListPage } from './code-factory/SessionListPage.tsx'
import { CodeReviewPage } from './code-factory/CodeReviewPage.tsx'
import { DiffPage } from './code-factory/DiffPage.tsx'
import { ProjectInitPage } from './code-factory/ProjectInitPage.tsx'
import { GithubAutomationPage } from './code-factory/GithubAutomationPage.tsx'
import { ConfigManagePage } from './code-factory/ConfigManagePage.tsx'

export function CodeFactoryPage() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/sessions" element={<SessionListPage />} />
        <Route path="/review" element={<CodeReviewPage />} />
        <Route path="/diff" element={<DiffPage />} />
        <Route path="/project-init" element={<ProjectInitPage />} />
        <Route path="/github" element={<GithubAutomationPage />} />
        <Route path="/config" element={<ConfigManagePage />} />
      </Routes>
    </div>
  )
}
