import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.ts'

export type FieldPermission = 'none' | 'read' | 'write'

export function useFieldPermissions(resource: string) {
  return useQuery<Record<string, FieldPermission>>({
    queryKey: ['field-permissions', resource],
    queryFn: async () => {
      const res = await api.get('/session/fields', { params: { resource } })
      return res.data
    },
  })
}

export function canRead(permissions: Record<string, FieldPermission> | undefined, field: string): boolean {
  const perm = permissions?.[field]
  return perm === 'read' || perm === 'write'
}

export function canWrite(permissions: Record<string, FieldPermission> | undefined, field: string): boolean {
  return permissions?.[field] === 'write'
}
