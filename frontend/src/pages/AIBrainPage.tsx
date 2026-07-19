import { Routes, Route } from 'react-router-dom'
import { AgentManagementPage } from './ai-brain/AgentManagementPage.tsx'
import { KnowledgeBasePage } from './ai-brain/KnowledgeBasePage.tsx'
import { ModelCenterPage } from './ai-brain/ModelCenterPage.tsx'
import { McpToolsPage } from './ai-brain/McpToolsPage.tsx'
import { AgentChatPage } from './ai-brain/AgentChatPage.tsx'
import { AgentPublishPage } from './ai-brain/AgentPublishPage.tsx'
import { AppPermissionsPage } from './ai-brain/AppPermissionsPage.tsx'
import { OrchestrationPage } from './ai-brain/OrchestrationPage.tsx'

export function AIBrainPage() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<AgentChatPage />} />
        <Route path="/agents" element={<AgentManagementPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/models" element={<ModelCenterPage />} />
        <Route path="/mcp" element={<McpToolsPage />} />
        <Route path="/chat/:agentId?" element={<AgentChatPage />} />
        <Route path="/publish" element={<AgentPublishPage />} />
        <Route path="/permissions" element={<AppPermissionsPage />} />
        <Route path="/orchestration" element={<OrchestrationPage />} />
      </Routes>
    </div>
  )
}
