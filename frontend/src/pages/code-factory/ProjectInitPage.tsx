import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'

type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'
type ProjectStatus = 'active' | 'archived' | 'deleted'

interface ProjectPathOption {
  path: string
  name: string
  occupied: boolean
}

interface PlatformUser {
  id: number
  username: string
  email?: string
}

interface ProjectListItem {
  id: number
  name: string
  description?: string
  projectPath: string
  templateId?: number | null
  status: ProjectStatus
  memberCount: number
  updatedAt?: string
}

interface ProjectMember {
  id: number
  platformUserId: number
  role: ProjectRole
  username: string
  email?: string
  createdAt?: string
}

interface ProjectDetail extends ProjectListItem {
  members: ProjectMember[]
  myRole?: ProjectRole | null
}

const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: '所有者',
  admin: '管理员',
  member: '成员',
  viewer: '观察者',
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: '活跃',
  archived: '归档',
  deleted: '已删除',
}

export function ProjectInitPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [pathOptions, setPathOptions] = useState<ProjectPathOption[]>([])
  const [workspaceRoot, setWorkspaceRoot] = useState('')
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    projectPath: '',
  })
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    projectPath: '',
  })

  const [detail, setDetail] = useState<ProjectDetail | null>(null)
  const [addUserId, setAddUserId] = useState('')
  const [addRole, setAddRole] = useState<ProjectRole>('member')

  const loadProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/projects', { params: { status: statusFilter } })
      setProjects(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || '加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  const loadMeta = async () => {
    const results = await Promise.allSettled([
      api.get('/project-paths'),
      api.get('/project-candidate-users'),
    ])
    if (results[0].status === 'fulfilled') {
      setPathOptions(results[0].value.data.paths || [])
      setWorkspaceRoot(results[0].value.data.workspaceRoot || '')
    }
    if (results[1].status === 'fulfilled') {
      setUsers(results[1].value.data || [])
    }
  }

  const loadCandidateUsers = async () => {
    try {
      const res = await api.get('/project-candidate-users')
      setUsers(res.data || [])
    } catch {
      // keep previous list
    }
  }

  const openEdit = async (id: number) => {
    setError('')
    try {
      const res = await api.get(`/projects/${id}`)
      const data = res.data as ProjectDetail
      setDetail(data)
      setEditForm({
        name: data.name || '',
        description: data.description || '',
        projectPath: data.projectPath || '',
      })
      setAddUserId('')
      setAddRole('member')
      setEditOpen(true)
      await loadCandidateUsers()
      await loadMeta()
    } catch (err: any) {
      setError(err?.response?.data?.error || '加载项目失败')
    }
  }

  const closeEdit = () => {
    setEditOpen(false)
    setDetail(null)
  }

  const refreshDetail = async (id: number) => {
    const res = await api.get(`/projects/${id}`)
    const data = res.data as ProjectDetail
    setDetail(data)
    setEditForm({
      name: data.name || '',
      description: data.description || '',
      projectPath: data.projectPath || '',
    })
  }

  useEffect(() => {
    loadMeta().catch(() => {})
  }, [])

  useEffect(() => {
    loadProjects()
  }, [statusFilter])

  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(() => setSuccess(''), 2500)
    return () => window.clearTimeout(timer)
  }, [success])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.projectPath.toLowerCase().includes(q),
    )
  }, [projects, search])

  const createPathOptions = useMemo(
    () => pathOptions.filter((p) => !p.occupied),
    [pathOptions],
  )

  const editPathOptions = useMemo(() => {
    if (!detail) return pathOptions.filter((p) => !p.occupied)
    return pathOptions.filter((p) => !p.occupied || p.path === detail.projectPath)
  }, [pathOptions, detail])

  const openCreate = () => {
    const defaultPath = createPathOptions[0]?.path || ''
    setCreateForm({ name: '', description: '', projectPath: defaultPath })
    setCreateOpen(true)
    loadMeta().catch(() => {})
  }

  const createProject = async () => {
    if (!createForm.name.trim() || !createForm.projectPath.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/projects', {
        name: createForm.name,
        description: createForm.description,
        projectPath: createForm.projectPath,
      })
      setCreateOpen(false)
      await loadProjects()
      await loadMeta()
      await openEdit(res.data.id)
    } catch (err: any) {
      setError(err?.response?.data?.error || '创建项目失败')
    } finally {
      setSaving(false)
    }
  }

  const saveProject = async () => {
    if (!detail) return
    if (!editForm.name.trim() || !editForm.projectPath.trim()) return
    setSaving(true)
    setError('')
    try {
      await api.put(`/projects/${detail.id}`, {
        name: editForm.name.trim(),
        description: editForm.description,
        projectPath: editForm.projectPath,
      })
      await loadProjects()
      await loadMeta()
      closeEdit()
      setSuccess('保存成功')
    } catch (err: any) {
      setError(err?.response?.data?.error || '保存项目失败')
    } finally {
      setSaving(false)
    }
  }

  const archiveProject = async (id: number) => {
    if (!confirm('确定归档该项目？')) return
    await api.delete(`/projects/${id}?mode=archive`)
    closeEdit()
    loadProjects()
    loadMeta()
  }

  const addMember = async () => {
    if (!detail || !addUserId) return
    try {
      await api.post(`/projects/${detail.id}/members`, {
        platformUserId: Number(addUserId),
        role: addRole,
      })
      setAddUserId('')
      await refreshDetail(detail.id)
      await loadProjects()
    } catch (err: any) {
      setError(err?.response?.data?.error || '添加成员失败')
    }
  }

  const removeMember = async (memberUserId: number) => {
    if (!detail) return
    if (!confirm('确定移除该成员？')) return
    try {
      await api.delete(`/projects/${detail.id}/members/${memberUserId}`)
      await refreshDetail(detail.id)
      await loadProjects()
    } catch (err: any) {
      setError(err?.response?.data?.error || '移除成员失败')
    }
  }

  const updateMemberRole = async (memberUserId: number, role: ProjectRole) => {
    if (!detail) return
    try {
      await api.put(`/projects/${detail.id}/members/${memberUserId}`, { role })
      await refreshDetail(detail.id)
    } catch (err: any) {
      setError(err?.response?.data?.error || '修改角色失败')
    }
  }

  const canManage = detail?.myRole === 'owner' || detail?.myRole === 'admin'
  const candidateUsers = users.filter(
    (u) => !detail?.members.some((m) => m.platformUserId === u.id),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">项目初始化</h2>
          <p className="text-sm text-slate-500">新建项目、指定服务器绝对路径，并分配项目成员。</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 新建项目
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div>
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索项目名称或路径..."
              className="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="active">活跃</option>
              <option value="archived">归档</option>
              <option value="all">全部</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">加载中...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">暂无项目，点击右上角新建。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-4">项目名称</th>
                    <th className="py-2 pr-4">项目路径</th>
                    <th className="py-2 pr-4">成员</th>
                    <th className="py-2 pr-4">状态</th>
                    <th className="py-2 pr-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-800">{p.name}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-slate-600">{p.projectPath}</td>
                      <td className="py-3 pr-4">{p.memberCount} 人</td>
                      <td className="py-3 pr-4">{STATUS_LABELS[p.status]}</td>
                      <td className="py-3 pr-0 text-right">
                        <button
                          onClick={() => openEdit(p.id)}
                          className="rounded-md px-2 py-1 text-indigo-600 hover:bg-indigo-50"
                        >
                          编辑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold">新建项目</h3>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-sm text-slate-600">项目名称</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="例如 web-app"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">项目描述</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">项目路径（服务器绝对路径）</label>
                <select
                  value={createForm.projectPath}
                  onChange={(e) => setCreateForm({ ...createForm, projectPath: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                >
                  <option value="">请选择项目目录</option>
                  {createPathOptions.map((p) => (
                    <option key={p.path} value={p.path}>
                      {p.name} — {p.path}
                    </option>
                  ))}
                </select>
                {workspaceRoot && (
                  <p className="mt-1 text-xs text-slate-400">扫描目录：{workspaceRoot}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={createProject}
                disabled={saving || !createForm.name.trim() || !createForm.projectPath.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold">编辑项目</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  状态：{STATUS_LABELS[detail.status]}
                  {detail.myRole ? ` · 我的角色：${ROLE_LABELS[detail.myRole]}` : ''}
                </p>
              </div>
              <button
                onClick={closeEdit}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                关闭
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto px-6 py-5">
              <section className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800">项目信息</h4>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">项目名称</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={!canManage}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">项目描述</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    disabled={!canManage}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">项目路径</label>
                  <select
                    value={editForm.projectPath}
                    onChange={(e) => setEditForm({ ...editForm, projectPath: e.target.value })}
                    disabled={!canManage}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm disabled:bg-slate-50"
                  >
                    {editPathOptions.map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.name} — {p.path}
                      </option>
                    ))}
                    {!editPathOptions.some((p) => p.path === editForm.projectPath) && editForm.projectPath && (
                      <option value={editForm.projectPath}>{editForm.projectPath}</option>
                    )}
                  </select>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <button
                      onClick={saveProject}
                      disabled={saving || !editForm.name.trim() || !editForm.projectPath.trim()}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {saving ? '保存中...' : '保存信息'}
                    </button>
                    {detail.status === 'active' && (
                      <button
                        onClick={() => archiveProject(detail.id)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        归档
                      </button>
                    )}
                  </div>
                )}
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-5">
                <h4 className="text-sm font-semibold text-slate-800">项目成员</h4>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="py-2 pr-4">用户名</th>
                      <th className="py-2 pr-4">角色</th>
                      <th className="py-2 pr-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.members.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100">
                        <td className="py-2 pr-4">{m.username}</td>
                        <td className="py-2 pr-4">
                          {m.role === 'owner' || !canManage ? (
                            ROLE_LABELS[m.role]
                          ) : (
                            <select
                              value={m.role}
                              onChange={(e) => updateMemberRole(m.platformUserId, e.target.value as ProjectRole)}
                              className="rounded border border-slate-200 px-2 py-1"
                            >
                              <option value="admin">管理员</option>
                              <option value="member">成员</option>
                              <option value="viewer">观察者</option>
                            </select>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {canManage && m.role !== 'owner' ? (
                            <button
                              onClick={() => removeMember(m.platformUserId)}
                              className="text-red-600 hover:underline"
                            >
                              移除
                            </button>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {canManage && (
                  <div className="flex flex-wrap items-end gap-2 pt-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">添加成员</label>
                      <select
                        value={addUserId}
                        onChange={(e) => setAddUserId(e.target.value)}
                        className="min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">选择用户</option>
                        {candidateUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username}
                            {u.email ? ` (${u.email})` : ''}
                          </option>
                        ))}
                      </select>
                      {candidateUsers.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">暂无其他可添加用户。</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">角色</label>
                      <select
                        value={addRole}
                        onChange={(e) => setAddRole(e.target.value as ProjectRole)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="admin">管理员</option>
                        <option value="member">成员</option>
                        <option value="viewer">观察者</option>
                      </select>
                    </div>
                    <button
                      onClick={addMember}
                      disabled={!addUserId}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      添加
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
