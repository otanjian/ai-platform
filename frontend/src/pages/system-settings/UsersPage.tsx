import { useEffect, useState } from 'react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'
import { useFieldPermissions, canRead, canWrite } from '../../hooks/useFieldPermissions.ts'

interface KeycloakUser {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  enabled: boolean
}

interface Role {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
}

export function UsersPage() {
  const { data: fieldPerms } = useFieldPermissions('user')
  const [users, setUsers] = useState<KeycloakUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<KeycloakUser | null>(null)
  const [managingUser, setManagingUser] = useState<KeycloakUser | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const [form, setForm] = useState({ username: '', email: '', firstName: '', lastName: '', enabled: true, password: '' })

  const fetchUsers = async () => {
    setLoading(true)
    const res = await api.get('/admin/keycloak/users')
    setUsers(res.data)
    setLoading(false)
  }

  const fetchRolesAndGroups = async () => {
    const [rolesRes, groupsRes] = await Promise.all([api.get('/admin/keycloak/roles'), api.get('/admin/keycloak/groups')])
    setRoles(rolesRes.data)
    setGroups(groupsRes.data)
  }

  useEffect(() => {
    fetchUsers()
    fetchRolesAndGroups()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ username: '', email: '', firstName: '', lastName: '', enabled: true, password: '' })
    setFormOpen(true)
  }

  const openEdit = (user: KeycloakUser) => {
    setEditing(user)
    setForm({ username: user.username, email: user.email || '', firstName: user.firstName || '', lastName: user.lastName || '', enabled: user.enabled, password: '' })
    setFormOpen(true)
  }

  const saveUser = async () => {
    try {
      if (editing) {
        const { password: _pw, ...fields } = form
        await api.put(`/admin/keycloak/users/${editing.id}`, fields)
      } else {
        if (!form.password) {
          alert('新建用户须设置密码（6–20 位，含字母和数字），以便同步到 BuildingAI')
          return
        }
        const res = await api.post('/admin/keycloak/users', form)
        const sync = res.data?.buildingAiSync
        if (sync && !sync.ok) {
          alert(`用户已创建，但 BuildingAI 同步失败：${sync.error}`)
        }
      }
      setFormOpen(false)
      fetchUsers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      alert(msg || '保存用户失败')
    }
  }

  const toggleEnabled = async (user: KeycloakUser) => {
    await api.put(`/admin/keycloak/users/${user.id}`, { enabled: !user.enabled })
    fetchUsers()
  }

  const deleteUser = async (user: KeycloakUser) => {
    if (!confirm(`确定删除用户 ${user.username} 吗？`)) return
    await api.delete(`/admin/keycloak/users/${user.id}`)
    fetchUsers()
  }

  const resetPassword = async (user: KeycloakUser) => {
    const pwd = prompt(`为 ${user.username} 设置新密码（6–20 位，含字母和数字）：`)
    if (!pwd) return
    try {
      const res = await api.put(`/admin/keycloak/users/${user.id}/password`, { password: pwd, temporary: false })
      if (res.data?.warning) {
        alert(res.data.warning)
      } else {
        alert('密码已重置，并已同步到 BuildingAI')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      alert(msg || '重置密码失败')
    }
  }

  const openManageMembership = async (user: KeycloakUser) => {
    setManagingUser(user)
    const [rolesRes, groupsRes] = await Promise.all([api.get(`/admin/keycloak/users/${user.id}/roles`), api.get(`/admin/keycloak/users/${user.id}/groups`)])
    setUserRoles(rolesRes.data)
    setUserGroups(groupsRes.data)
  }

  const toggleRole = async (roleName: string) => {
    if (!managingUser) return
    const has = userRoles.includes(roleName)
    const assign = has ? [] : [roleName]
    const remove = has ? [roleName] : []
    await api.put(`/admin/keycloak/users/${managingUser.id}/roles`, { assign, remove })
    const res = await api.get(`/admin/keycloak/users/${managingUser.id}/roles`)
    setUserRoles(res.data)
  }

  const toggleGroup = async (group: Group) => {
    if (!managingUser) return
    const has = userGroups.some((g) => g.id === group.id)
    const assign = has ? [] : [group.id]
    const remove = has ? [group.id] : []
    await api.put(`/admin/keycloak/users/${managingUser.id}/groups`, { assign, remove })
    const res = await api.get(`/admin/keycloak/users/${managingUser.id}/groups`)
    setUserGroups(res.data)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">用户管理</h2>
        {canWrite(fieldPerms, 'username') && (
          <button onClick={openCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            新建用户
          </button>
        )}
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
                    {canRead(fieldPerms, 'username') && <th className="py-2 pr-4">用户名</th>}
                    {canRead(fieldPerms, 'email') && <th className="py-2 pr-4">邮箱</th>}
                    {(canRead(fieldPerms, 'firstName') || canRead(fieldPerms, 'lastName')) && <th className="py-2 pr-4">姓名</th>}
                    {canRead(fieldPerms, 'enabled') && <th className="py-2 pr-4">状态</th>}
                    <th className="py-2 pr-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      {canRead(fieldPerms, 'username') && <td className="py-3 pr-4 font-medium text-slate-900">{user.username}</td>}
                      {canRead(fieldPerms, 'email') && <td className="py-3 pr-4 text-slate-600">{user.email || '-'}</td>}
                      {(canRead(fieldPerms, 'firstName') || canRead(fieldPerms, 'lastName')) && (
                        <td className="py-3 pr-4 text-slate-600">{[canRead(fieldPerms, 'firstName') ? user.firstName : '', canRead(fieldPerms, 'lastName') ? user.lastName : ''].filter(Boolean).join(' ') || '-'}</td>
                      )}
                      {canRead(fieldPerms, 'enabled') && (
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-1 text-xs ${user.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.enabled ? '启用' : '禁用'}
                          </span>
                        </td>
                      )}
                      <td className="py-3 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          {canWrite(fieldPerms, 'username') && <button onClick={() => openEdit(user)} className="text-indigo-600 hover:underline">编辑</button>}
                          <button onClick={() => openManageMembership(user)} className="text-indigo-600 hover:underline">角色/组</button>
                          {canWrite(fieldPerms, 'password') && <button onClick={() => resetPassword(user)} className="text-indigo-600 hover:underline">重置密码</button>}
                          {canWrite(fieldPerms, 'enabled') && <button onClick={() => toggleEnabled(user)} className="text-slate-600 hover:underline">{user.enabled ? '禁用' : '启用'}</button>}
                          {canWrite(fieldPerms, 'username') && <button onClick={() => deleteUser(user)} className="text-red-600 hover:underline">删除</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">{editing ? '编辑用户' : '新建用户'}</h3>
            <div className="space-y-3">
              {canRead(fieldPerms, 'username') && (
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="用户名" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" disabled={!!editing || !canWrite(fieldPerms, 'username')} />
              )}
              {canRead(fieldPerms, 'email') && (
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="邮箱" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" disabled={!canWrite(fieldPerms, 'email')} />
              )}
              {canRead(fieldPerms, 'firstName') && (
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="名" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" disabled={!canWrite(fieldPerms, 'firstName')} />
              )}
              {canRead(fieldPerms, 'lastName') && (
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="姓" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" disabled={!canWrite(fieldPerms, 'lastName')} />
              )}
              {!editing && canWrite(fieldPerms, 'password') && (
                <div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="初始密码（6–20 位，含字母和数字）"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">将同步到 BuildingAI，用户名与密码保持一致</p>
                </div>
              )}
              {canRead(fieldPerms, 'enabled') && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} disabled={!canWrite(fieldPerms, 'enabled')} />
                  启用
                </label>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setFormOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">取消</button>
              <button onClick={saveUser} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">保存</button>
            </div>
          </div>
        </div>
      )}

      {managingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">管理 {managingUser.username} 的角色与组</h3>
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-slate-700">Realm 角色</h4>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                    <input type="checkbox" checked={userRoles.includes(role.name)} onChange={() => toggleRole(role.name)} />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700">组</h4>
              <div className="grid grid-cols-2 gap-2">
                {groups.map((group) => (
                  <label key={group.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                    <input type="checkbox" checked={userGroups.some((g) => g.id === group.id)} onChange={() => toggleGroup(group)} />
                    {group.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setManagingUser(null)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">完成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
