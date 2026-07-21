import { describe, expect, test } from "bun:test"
import { TASK_HUB_MENU_ITEMS, platformTaskHubPathToTaskViewPath } from "../src/task-hub-menus.ts"
import {
  DATA_INSIGHTS_SUPERSET_MENU_ITEMS,
  platformDataInsightsPathToSupersetPath,
} from "../src/data-insights-superset-menus.ts"
import { buildMenuTreeFromFlat } from "../src/menu-tree.ts"

describe("task hub menus", () => {
  test("L1 sort is between dashboard(1) and code_factory(3)", () => {
    const hub = TASK_HUB_MENU_ITEMS.find((m) => m.code === "task_hub")
    expect(hub?.sort).toBe(2)
    expect(hub?.parent).toBeNull()
  })

  test("full mirror has inbox and settings leaves", () => {
    const codes = new Set(TASK_HUB_MENU_ITEMS.map((m) => m.code))
    expect(codes.has("task_hub.inbox")).toBe(true)
    expect(codes.has("task_hub.settings")).toBe(true)
    expect(codes.has("task_hub.kanban")).toBe(true)
  })

  test("path mapper maps distinct embed views", () => {
    expect(platformTaskHubPathToTaskViewPath("/task-hub/inbox")).toBe("/?_tv=inbox&_embed=1")
    expect(platformTaskHubPathToTaskViewPath("/task-hub/kanban")).toBe("/?_tv=kanban&_embed=1")
    expect(platformTaskHubPathToTaskViewPath("/task-hub/settings")).toBe("/?_tv=settings&_embed=1")
    expect(platformTaskHubPathToTaskViewPath("/task-hub/unknown")).toBeNull()
  })
})

describe("data insights superset menus", () => {
  test("does not include obsolete DataEase-era menu codes", () => {
    const codes = DATA_INSIGHTS_SUPERSET_MENU_ITEMS.map((m) => m.code)
    expect(codes).not.toContain("data_insights.smart_qa")
    expect(codes).not.toContain("data_insights.orgs")
    expect(codes).not.toContain("data_insights.embedded")
  })

  test("includes SQL Lab and security leaves", () => {
    const codes = new Set(DATA_INSIGHTS_SUPERSET_MENU_ITEMS.map((m) => m.code))
    expect(codes.has("data_insights.sqllab")).toBe(true)
    expect(codes.has("data_insights.security.users")).toBe(true)
  })

  test("path mapper maps dashboards and sqllab", () => {
    expect(platformDataInsightsPathToSupersetPath("/data-insights/dashboards")).toBe(
      "/dashboard/list/",
    )
    expect(platformDataInsightsPathToSupersetPath("/data-insights/sqllab")).toBe("/sqllab/")
  })
})

describe("menu tree order", () => {
  test("task_hub appears before code_factory in tree roots", () => {
    const flat = [
      { code: "dashboard", label: "总览", icon: "x", path: "/dashboard", parent: null, sort: 1 },
      ...TASK_HUB_MENU_ITEMS,
      { code: "code_factory", label: "代码工场", icon: "x", path: "/code-factory", parent: null, sort: 3 },
      ...DATA_INSIGHTS_SUPERSET_MENU_ITEMS,
    ]
    const tree = buildMenuTreeFromFlat(flat)
    const roots = tree.map((n) => n.code)
    expect(roots.indexOf("task_hub")).toBeLessThan(roots.indexOf("code_factory"))
    expect(roots.indexOf("code_factory")).toBeLessThan(roots.indexOf("data_insights"))
  })
})
