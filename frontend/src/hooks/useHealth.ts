import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.ts'

export type Health = {
  status: string
  database: string
  redis: string
  keycloak: string
  opencode: string
  taskview: string
  superset: string
  buildingai: string
}

export function useHealth() {
  return useQuery<Health>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/gateway/health')
      return res.data
    },
    refetchInterval: 30_000,
  })
}
