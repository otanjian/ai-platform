import { useEffect, useState } from 'react'
import { api } from '../../lib/api.ts'
import { Card, CardContent } from '../../components/ui/Card.tsx'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface PlatformRole {
  id: number
  name: string
  keycloakRoleName: string
  displayName?: string
  description?: string
}

interface KeycloakRole {
  id: string
  name: string
}

interface MenuPermission {
  menuCode: string
  permission: 'none' | 'read' | 'write' | 'admin'
}

interface MenuItem {
  code: string
  label: string
  path: string
  children?: MenuItem[]
}

export function RolesPage() {
  const [roles, setRoles] = useState<PlatformRole[]>([])
  const [keycloakRoles, setKeycloakRoles] = useState<KeycloakRole[]>([])
  const [menuTree, setMenuTree] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<PlatformRole | null>(null)
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', keycloakRoleName: '', displayName: '', description: '' })

  const fetchData = async () => {
    setLoading(true)
    const [rolesRes, kcRes, menuRes] = await Promise.all([
      api.get('/admin/roles'),
      api.get('/admin/keycloak/roles'),
      api.get('/admin/menu-tree'),
    ])
    setRoles(rolesRes.data)
    setKeycloakRoles(kcRes.data)
    setMenuTree(menuRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', keycloakRoleName: '', displayName: '', description: '' })
    setSelectedMenus(new Set())
    setExpanded(new Set(menuTree.map((m) => m.code)))
    setEditOpen(true)
  }

  const openEdit = async (role: PlatformRole) => {
    setEditing(role)
    setForm({
      name: role.name,
      keycloakRoleName: role.keycloakRoleName,
      displayName: role.displayName || '',
      description: role.description || '',
    })
    const res = await api.get(`/admin/roles/${role.id}/permissions`)
    const perms = res.data as MenuPermission[]
    const selected = new Set<string>()
    for (const item of perms) {
      if (item.permission && item.permission !== 'none') {
        selected.add(item.menuCode)
      }
    }
    setSelectedMenus(selected)
    setExpanded(new Set(menuTree.map((m) => m.code)))
    setEditOpen(true)
  }

  const deleteRole = async (role: PlatformRole) => {
    if (!confirm(`确定删除角色 ${role.name} 吗？`)) return
    await api.delete(`/admin/roles/${role.id}`)
    fetchData()
  }

  const collectAllCodes = (items: MenuItem[]): string[] => {
    const codes: string[] = []
    for (const item of items) {
      codes.push(item.code)
      if (item.children) codes.push(...collectAllCodes(item.children))
    }
    return codes
  }

  const toggleExpand = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const getChildCodes = (item: MenuItem): string[] => {
    if (!item.children || item.children.length === 0) return []
    return item.children.flatMap((c) => [c.code, ...getChildCodes(c)])
  }

  const toggleMenu = (item: MenuItem, checked: boolean) => {
    setSelectedMenus((prev) => {
      const next = new Set(prev)
      const codes = [item.code, ...getChildCodes(item)]
      if (checked) {
        for (const code of codes) next.add(code)
      } else {
        for (const code of codes) next.delete(code)
      }
      // Sync parent checkbox with children
      for (const root of menuTree) {
        if (!root.children || root.children.length === 0) continue
        const isRelated =
          root.code === item.code ||
          root.children.some((c) => c.code === item.code || getChildCodes(c).includes(item.code))
        if (!isRelated) continue
        const childCodes = getChildCodes(root)
        const anyChecked = childCodes.some((c) => next.has(c))
        if (anyChecked) next.add(root.code)
        else if (!checked && root.code !== item.code) next.delete(root.code)
      }
      return next
    })
  }

  const isChecked = (code: string) => selectedMenus.has(code)

  const isIndeterminate = (item: MenuItem): boolean => {
    if (!item.children || item.children.length === 0) return false
    const childCodes = getChildCodes(item)
    const checkedCount = childCodes.filter((c) => selectedMenus.has(c)).length
    return checkedCount > 0 && checkedCount < childCodes.length
  }

  const saveAll = async () => {
    if (!form.name.trim() || !form.keycloakRoleName.trim()) return
    setSaving(true)
    try {
      let roleId = editing?.id
      if (editing) {
        await api.put(`/admin/roles/${editing.id}`, form)
      } else {
        const res = await api.post('/admin/roles', form)
        roleId = res.data.id
      }
      if (roleId) {
        const allCodes = collectAllCodes(menuTree)
        const body = allCodes.map((menuCode) => ({
          menuCode,
          permission: selectedMenus.has(menuCode) ? 'write' : 'none',
        }))
        await api.put(`/admin/roles/${roleId}/permissions`, body)
      }
      setEditOpen(false)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const renderMenuTree = (items: MenuItem[], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = expanded.has(item.code)
      const checked = isChecked(item.code)
      const indeterminate = isIndeterminate(item)
      return (
        <div key={item.code}>
          <div
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {hasChildren ? (
              <button type="button" onClick={() => toggleExpand(item.code)} className="text-slate-400 hover:text-slate-600">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                ref={(el) => {
                  if (el) el.indeterminate = indeterminate
                }}
                onChange={(e) => toggleMenu(item, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <span className={depth === 0 ? 'font-medium text-slate-900' : 'text-slate-700'}>{item.label}</span>
            </label>
          </div>
          {hasChildren && isExpanded && renderMenuTree(item.children!, depth + 1)}
        </div>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">角色管理</h2>
        <button onClick={openCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          新增角色
        </button>
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
                    <th className="py-2 pr-4">角色标识</th>
                    <th className="py-2 pr-4">显示名称</th>
                    <th className="py-2 pr-4">Keycloak 角色</th>
                    <th className="py-2 pr-4">描述</th>
                    <th className="py-2 pr-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{role.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{role.displayName || '-'}</td>
                      <td className="py-3 pr-4 text-slate-600">{role.keycloakRoleName}</td>
                      <td className="py-3 pr-4 text-slate-600">{role.description || '-'}</td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openEdit(role)} className="text-indigo-600 hover:underline">编辑</button>
                          <button onClick={() => deleteRole(role)} className="text-red-600 hover:underline">删除</button>
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

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-lg bg-white shadow-lg">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold">{editing ? '编辑角色' : '新增角色'}</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-6 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">角色标识</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="如 developer"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    disabled={!!editing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Keycloak 角色</label>
                  <select
                    value={form.keycloakRoleName}
                    onChange={(e) => setForm({ ...form, keycloakRoleName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">选择 Keycloak 角色</option>
                    {keycloakRoles.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">显示名称</label>
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="如 开发者"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">描述</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="角色描述"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-900">菜单权限</label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedMenus(new Set(collectAllCodes(menuTree)))}
                      className="text-indigo-600 hover:underline"
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMenus(new Set())}
                      className="text-slate-500 hover:underline"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-2">
                  {renderMenuTree(menuTree)}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setEditOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">取消</button>
              <button
                onClick={saveAll}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
