import { useEffect, useState } from 'react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'

interface KeycloakUser {
  id: string
  username: string
}

interface Session {
  id: string
  ipAddress?: string
  start?: number
  lastAccess?: number
}

export function SessionsPage() {
  const [users, setUsers] = useState<KeycloakUser[]>([])
  const [sessions, setSessions] = useState<Record<string, Session[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const usersRes = await api.get('/admin/keycloak/users')
    const userList = usersRes.data as KeycloakUser[]
    setUsers(userList)
    const map: Record<string, Session[]> = {}
    await Promise.all(
      userList.map(async (user) => {
        const res = await api.get(`/admin/keycloak/users/${user.id}/sessions`)
        map[user.id] = res.data
      })
    )
    setSessions(map)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const logoutUser = async (user: KeycloakUser) => {
    if (!confirm(`确定强制登出 ${user.username} 的所有会话吗？`)) return
    await api.post(`/admin/keycloak/users/${user.id}/logout`)
    fetchData()
  }

  const formatTime = (ts?: number) => {
    if (!ts) return '-'
    return new Date(ts * 1000).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">会话管理</h2>
        <button onClick={fetchData} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">刷新</button>
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">加载中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-4">用户名</th>
                    <th className="py-2 pr-4">活跃会话数</th>
                    <th className="py-2 pr-4">最近访问</th>
                    <th className="py-2 pr-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const userSessions = sessions[user.id] || []
                    const lastAccess = userSessions.length > 0 ? Math.max(...userSessions.map((s) => s.lastAccess || 0)) : undefined
                    return (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium text-slate-900">{user.username}</td>
                        <td className="py-3 pr-4 text-slate-600">{userSessions.length}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatTime(lastAccess)}</td>
                        <td className="py-3 pr-4 text-right">
                          <button onClick={() => logoutUser(user)} className="text-red-600 hover:underline">强制登出</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
