import { describe, expect, it } from 'vitest'
import { fileLabel, parsePatchLines, statusLabel } from './diff-view.ts'

describe('statusLabel', () => {
  it('maps known statuses', () => {
    expect(statusLabel('added')).toBe('新增')
    expect(statusLabel('deleted')).toBe('删除')
    expect(statusLabel('modified')).toBe('修改')
  })
})

describe('fileLabel', () => {
  it('falls back when file missing', () => {
    expect(fileLabel({ additions: 1, deletions: 0 }, 2)).toBe('file-3')
  })
})

describe('parsePatchLines', () => {
  it('classifies add/del/hunk/ctx lines', () => {
    const lines = parsePatchLines('@@ -1,2 +1,3 @@\n context\n-old\n+new\n+++ header\n--- header')
    expect(lines.map((l) => l.kind)).toEqual(['hunk', 'ctx', 'del', 'add', 'ctx', 'ctx'])
  })

  it('returns empty for missing patch', () => {
    expect(parsePatchLines(undefined)).toEqual([])
  })
})
