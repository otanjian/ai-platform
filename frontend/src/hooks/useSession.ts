import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.ts'

export type Session = {
  authenticated: boolean
  username: string
  oidc: {
    sub: string
    email?: string
    name?: string
    realmRoles: string[]
    groups: string[]
  } | null
}

export function useSession() {
  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await api.get('/session')
      return res.data
    },
  })
}
