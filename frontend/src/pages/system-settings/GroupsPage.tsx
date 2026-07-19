import { useEffect, useState } from 'react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'

interface Group {
  id: string
  name: string
  path?: string
}

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')

  const fetchGroups = async () => {
    setLoading(true)
    const res = await api.get('/admin/keycloak/groups')
    setGroups(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const createGroup = async () => {
    if (!name.trim()) return
    await api.post('/admin/keycloak/groups', { name: name.trim() })
    setName('')
    fetchGroups()
  }

  const deleteGroup = async (group: Group) => {
    if (!confirm(`确定删除组 ${group.name} 吗？`)) return
    await api.delete(`/admin/keycloak/groups/${group.id}`)
    fetchGroups()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">组管理</h2>
      </div>
      <Card>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="组名称" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button onClick={createGroup} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">创建组</button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">加载中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-4">组名</th>
                    <th className="py-2 pr-4">路径</th>
                    <th className="py-2 pr-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{group.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{group.path || '-'}</td>
                      <td className="py-3 pr-4 text-right">
                        <button onClick={() => deleteGroup(group)} className="text-red-600 hover:underline">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
