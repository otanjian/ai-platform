import { Routes, Route } from 'react-router-dom'
import { DashboardsPage } from './data-insights/DashboardsPage.tsx'
import { ChartsPage } from './data-insights/ChartsPage.tsx'
import { DatasetsPage } from './data-insights/DatasetsPage.tsx'
import { DataSourcesPage } from './data-insights/DataSourcesPage.tsx'
import { SmartQAPage } from './data-insights/SmartQAPage.tsx'
import { ReportsPage } from './data-insights/ReportsPage.tsx'
import { DataPermissionsPage } from './data-insights/DataPermissionsPage.tsx'
import { EmbeddedPage } from './data-insights/EmbeddedPage.tsx'
import { OrgsPage } from './data-insights/OrgsPage.tsx'

export function DataInsightsPage() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<DashboardsPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/datasets" element={<DatasetsPage />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/smart-qa" element={<SmartQAPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/permissions" element={<DataPermissionsPage />} />
        <Route path="/orgs" element={<OrgsPage />} />
        <Route path="/embedded" element={<EmbeddedPage />} />
      </Routes>
    </div>
  )
}
