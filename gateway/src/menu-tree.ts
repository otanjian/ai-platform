import type { FlatMenuItem } from "./ai-brain-settings-menus.ts"

export type MenuTreeNode = {
  code: string
  label: string
  icon: string
  path: string
  children: MenuTreeNode[]
}

export function buildMenuTreeFromFlat(
  allMenuItems: FlatMenuItem[],
  allowed?: (code: string) => boolean,
): MenuTreeNode[] {
  const nest = (parentCode: string | null): MenuTreeNode[] =>
    allMenuItems
      .filter((m) => m.parent === parentCode && (!allowed || allowed(m.code)))
      .sort((a, b) => a.sort - b.sort)
      .map((m) => ({
        code: m.code,
        label: m.label,
        icon: m.icon,
        path: m.path,
        children: nest(m.code),
      }))
  return nest(null)
}

/** All descendants under a parent code (any depth). */
export function collectMenuDescendants(
  allMenuItems: FlatMenuItem[],
  parentCode: string,
): FlatMenuItem[] {
  const result: FlatMenuItem[] = []
  for (const child of allMenuItems.filter((m) => m.parent === parentCode)) {
    result.push(child)
    result.push(...collectMenuDescendants(allMenuItems, child.code))
  }
  return result
}
