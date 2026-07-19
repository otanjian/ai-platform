import { Routes, Route } from 'react-router-dom'
import { UsersPage } from './system-settings/UsersPage.tsx'
import { RolesPage } from './system-settings/RolesPage.tsx'
import { GroupsPage } from './system-settings/GroupsPage.tsx'
import { SessionsPage } from './system-settings/SessionsPage.tsx'
import { SubsystemsPage } from './system-settings/SubsystemsPage.tsx'
import { ApiKeysPage } from './system-settings/ApiKeysPage.tsx'
import { NotificationsPage } from './system-settings/NotificationsPage.tsx'
import { AuditLogsPage } from './system-settings/AuditLogsPage.tsx'
import { SettingsPage } from './system-settings/SettingsPage.tsx'
import { RoleMappingPage } from './system-settings/RoleMappingPage.tsx'
import { FieldsPermissionPage } from './system-settings/FieldsPermissionPage.tsx'

export function SystemSettingsPage() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/role-mapping" element={<RoleMappingPage />} />
        <Route path="/field-permissions" element={<FieldsPermissionPage />} />
        <Route path="/subsystems" element={<SubsystemsPage />} />
        <Route path="/api-keys" element={<ApiKeysPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Routes>
    </div>
  )
}
