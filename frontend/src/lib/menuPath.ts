import type { MenuItem } from '../hooks/useMenu.ts'

function matchesPath(itemPath: string, pathname: string): boolean {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

/** Deepest matching label chain for the current pathname (Sidebar match rules). */
export function findMenuLabelChain(
  menu: MenuItem[] | undefined,
  pathname: string,
): string[] {
  if (!menu?.length) return []

  let best: string[] = []

  const walk = (items: MenuItem[], parents: string[]) => {
    for (const item of items) {
      const chain = [...parents, item.label]
      if (item.path && matchesPath(item.path, pathname) && chain.length > best.length) {
        best = chain
      }
      if (item.children?.length) walk(item.children, chain)
    }
  }

  walk(menu, [])
  return best
}

/** Format menu path as `一级 / 二级`, or null when unmatched. */
export function formatMenuPath(
  menu: MenuItem[] | undefined,
  pathname: string,
): string | null {
  const chain = findMenuLabelChain(menu, pathname)
  if (chain.length === 0) return null
  return chain.join(' / ')
}
