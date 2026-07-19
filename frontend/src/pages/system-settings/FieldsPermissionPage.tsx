import { useEffect, useState } from 'react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'

interface Role {
  id: number
  name: string
  displayName: string
}

interface FieldPermission {
  id?: number
  resource: string
  field: string
  permission: 'none' | 'read' | 'write'
}

const RESOURCES = ['user']
const USER_FIELDS = ['username', 'email', 'firstName', 'lastName', 'enabled', 'password']

export function FieldsPermissionPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [roleId, setRoleId] = useState<number | ''>('')
  const [resource, setResource] = useState('user')
  const [rows, setRows] = useState<Record<string, FieldPermission['permission']>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/roles').then((res) => setRoles(res.data))
  }, [])

  useEffect(() => {
    if (!roleId || !resource) {
      setRows({})
      return
    }
    api.get(`/admin/roles/${roleId}/field-permissions`).then((res) => {
      const data = res.data as FieldPermission[]
      const map: Record<string, FieldPermission['permission']> = {}
      const fields = resource === 'user' ? USER_FIELDS : []
      for (const f of fields) map[f] = 'none'
      for (const item of data.filter((d) => d.resource === resource)) {
        map[item.field] = item.permission
      }
      setRows(map)
    })
  }, [roleId, resource])

  const save = async () => {
    if (!roleId) return
    setSaving(true)
    const body = Object.entries(rows).map(([field, permission]) => ({ resource, field, permission }))
    await api.put(`/admin/roles/${roleId}/field-permissions`, body)
    setSaving(false)
    alert('字段权限已保存')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">字段权限</h2>
      </div>
      <Card>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value) || '')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">选择角色</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.displayName || role.name}</option>
              ))}
            </select>
            <select value={resource} onChange={(e) => setResource(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {RESOURCES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {roleId ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-4">字段</th>
                    <th className="py-2 pr-4">权限</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rows).map(([field, permission]) => (
                    <tr key={field} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{field}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={permission}
                          onChange={(e) => setRows({ ...rows, [field]: e.target.value as FieldPermission['permission'] })}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="none">无权限</option>
                          <option value="read">只读</option>
                          <option value="write">读写</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4">
                <button onClick={save} disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">请选择角色和资源查看字段权限。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
