import { Routes, Route, Navigate } from 'react-router-dom'
import {
  AgentsEmbedPage,
  KnowledgeSectionEmbedPage,
  SettingsConsoleEmbedPage,
  WorkspaceSectionEmbedPage,
} from './ai-brain/BuildingAiEmbedPages.tsx'

export function AIBrainPage() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<Navigate to="chat" replace />} />
        <Route path="/chat" element={<WorkspaceSectionEmbedPage />} />
        <Route path="/apps" element={<WorkspaceSectionEmbedPage />} />
        <Route path="/history" element={<WorkspaceSectionEmbedPage />} />
        <Route path="/agents" element={<AgentsEmbedPage />} />
        <Route path="/knowledge" element={<Navigate to="/ai-brain/knowledge/plaza" replace />} />
        <Route path="/knowledge/*" element={<KnowledgeSectionEmbedPage />} />
        <Route path="/settings" element={<Navigate to="/ai-brain/settings/dashboard" replace />} />
        <Route path="/settings/*" element={<SettingsConsoleEmbedPage />} />
      </Routes>
    </div>
  )
}
