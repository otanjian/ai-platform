import { Routes, Route } from 'react-router-dom'
import { PipelineListPage } from './smart-pipeline/PipelineListPage.tsx'
import { PipelineCanvasPage } from './smart-pipeline/PipelineCanvasPage.tsx'
import { TemplateMarketPage } from './smart-pipeline/TemplateMarketPage.tsx'
import { ExecutionHistoryPage } from './smart-pipeline/ExecutionHistoryPage.tsx'
import { TriggersPage } from './smart-pipeline/TriggersPage.tsx'

export function SmartPipelinePage() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<PipelineListPage />} />
        <Route path="/canvas/:id?" element={<PipelineCanvasPage />} />
        <Route path="/templates" element={<TemplateMarketPage />} />
        <Route path="/history" element={<ExecutionHistoryPage />} />
        <Route path="/executions" element={<ExecutionHistoryPage />} />
        <Route path="/triggers" element={<TriggersPage />} />
      </Routes>
    </div>
  )
}
