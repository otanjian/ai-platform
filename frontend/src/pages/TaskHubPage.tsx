import { Routes, Route, Navigate } from 'react-router-dom'
import { TaskHubEmbedPage } from './task-hub/TaskViewEmbedPages.tsx'

export function TaskHubPage() {
  return (
    <Routes>
      <Route index element={<Navigate to="/task-hub/inbox" replace />} />
      <Route path="*" element={<TaskHubEmbedPage />} />
    </Routes>
  )
}
