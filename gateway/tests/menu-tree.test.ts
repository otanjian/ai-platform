import { describe, expect, it } from "bun:test"
import { AI_BRAIN_SETTINGS_MENU_ITEMS } from "../src/ai-brain-settings-menus.ts"
import { buildMenuTreeFromFlat, collectMenuDescendants } from "../src/menu-tree.ts"

describe("buildMenuTreeFromFlat", () => {
  it("nests settings without 工作空间 middle layer", () => {
    const items = [
      { code: "ai_brain", label: "AI大脑", icon: "Brain", path: "/ai-brain", parent: null, sort: 1 },
      {
        code: "ai_brain.settings",
        label: "设置",
        icon: "Settings",
        path: "/ai-brain/settings",
        parent: "ai_brain",
        sort: 1,
      },
      ...AI_BRAIN_SETTINGS_MENU_ITEMS,
    ]
    const tree = buildMenuTreeFromFlat(items)
    const settings = tree[0]?.children.find((c) => c.code === "ai_brain.settings")
    const labels = settings?.children.map((c) => c.label) ?? []
    expect(labels).toContain("数据看板")
    expect(labels).toContain("智能体列表")
    expect(labels).toContain("智能体后台")
    expect(labels).not.toContain("工作空间")
    const backend = settings?.children.find((c) => c.label === "智能体后台")
    expect(backend?.children.every((c) => c.children.length === 0)).toBe(true)
    expect(backend?.children.map((c) => c.label)).toContain("对话记录")
  })
})

describe("collectMenuDescendants", () => {
  it("returns all settings descendants", () => {
    const items = [
      {
        code: "ai_brain.settings",
        label: "设置",
        icon: "Settings",
        path: "/ai-brain/settings",
        parent: "ai_brain",
        sort: 1,
      },
      ...AI_BRAIN_SETTINGS_MENU_ITEMS,
    ]
    expect(collectMenuDescendants(items, "ai_brain.settings").length).toBe(
      AI_BRAIN_SETTINGS_MENU_ITEMS.length,
    )
  })
})
