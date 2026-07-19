export type DiffFile = {
  file?: string
  patch?: string
  additions: number
  deletions: number
  status?: string
}

export type DiffLineKind = 'add' | 'del' | 'hunk' | 'ctx'

export type DiffLine = {
  kind: DiffLineKind
  text: string
}

export function fileLabel(file: DiffFile, index: number): string {
  return file.file || `file-${index + 1}`
}

export function statusLabel(status?: string): string {
  switch (status) {
    case 'added':
      return '新增'
    case 'deleted':
      return '删除'
    case 'modified':
      return '修改'
    default:
      return status || '变更'
  }
}

export function parsePatchLines(patch?: string): DiffLine[] {
  if (!patch) return []
  return patch.split('\n').map((text) => {
    if (text.startsWith('@@')) return { kind: 'hunk' as const, text }
    if (text.startsWith('+') && !text.startsWith('+++')) return { kind: 'add' as const, text }
    if (text.startsWith('-') && !text.startsWith('---')) return { kind: 'del' as const, text }
    return { kind: 'ctx' as const, text }
  })
}
