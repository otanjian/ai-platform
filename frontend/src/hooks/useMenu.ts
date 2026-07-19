import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.ts'

export type MenuItem = {
  code: string
  label: string
  icon: string
  path: string
  children?: MenuItem[]
}

export function useMenu() {
  return useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await api.get('/session/menu')
      return res.data
    },
  })
}
