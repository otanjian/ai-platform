import { describe, expect, it } from 'vitest'
import type { MenuItem } from '../hooks/useMenu.ts'
import { formatMenuPath } from './menuPath.ts'

const menu: MenuItem[] = [
  {
    code: 'code-factory',
    label: '代码工厂',
    icon: 'Code',
    path: '/code-factory',
    children: [
      {
        code: 'sessions',
        label: '会话列表',
        icon: 'List',
        path: '/code-factory/sessions',
      },
    ],
  },
  {
    code: 'dashboard',
    label: '工作台',
    icon: 'Home',
    path: '/dashboard',
  },
]

describe('formatMenuPath', () => {
  it('returns parent / child for nested menu match', () => {
    expect(formatMenuPath(menu, '/code-factory/sessions')).toBe('代码工厂 / 会话列表')
  })

  it('returns single label for top-level leaf', () => {
    expect(formatMenuPath(menu, '/dashboard')).toBe('工作台')
  })

  it('returns null when no menu matches', () => {
    expect(formatMenuPath(menu, '/unknown/path')).toBeNull()
  })

  it('returns null when menu is undefined', () => {
    expect(formatMenuPath(undefined, '/dashboard')).toBeNull()
  })
})
