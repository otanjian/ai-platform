import { describe, expect, it } from "bun:test"
import {
  filterSessionOverview,
  groupSessionCountsByProject,
  type SessionOverviewItem,
} from "../src/session-overview"

const samples: SessionOverviewItem[] = [
  {
    id: 1,
    sessionId: "ses_aaa",
    projectId: 10,
    projectName: "Alpha",
    title: "修复登录",
    directory: "/data/alpha",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-19T10:00:00.000Z",
    embedUrl: "http://oc/session/ses_aaa",
  },
  {
    id: 2,
    sessionId: "ses_bbb",
    projectId: 20,
    projectName: "Beta",
    title: "重构网关",
    directory: "/data/beta",
    status: "active",
    createdAt: "2026-07-02T00:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
    embedUrl: "http://oc/session/ses_bbb",
  },
  {
    id: 3,
    sessionId: "ses_ccc",
    projectId: 10,
    projectName: "Alpha",
    title: null,
    directory: "/data/alpha",
    status: "active",
    createdAt: "2026-07-03T00:00:00.000Z",
    updatedAt: "2026-07-17T10:00:00.000Z",
    embedUrl: "http://oc/session/ses_ccc",
  },
]

describe("filterSessionOverview", () => {
  it("returns all when no filters", () => {
    expect(filterSessionOverview(samples, {}).length).toBe(3)
  })

  it("filters by projectId", () => {
    const rows = filterSessionOverview(samples, { projectId: 10 })
    expect(rows.map((r) => r.sessionId)).toEqual(["ses_aaa", "ses_ccc"])
  })

  it("filters by title query case-insensitively", () => {
    const rows = filterSessionOverview(samples, { query: "登录" })
    expect(rows).toHaveLength(1)
    expect(rows[0].sessionId).toBe("ses_aaa")
  })

  it("filters by sessionId substring", () => {
    const rows = filterSessionOverview(samples, { query: "SES_BBB" })
    expect(rows).toHaveLength(1)
    expect(rows[0].projectName).toBe("Beta")
  })

  it("combines project and query filters", () => {
    const rows = filterSessionOverview(samples, { projectId: 10, query: "ses_ccc" })
    expect(rows).toHaveLength(1)
    expect(rows[0].sessionId).toBe("ses_ccc")
  })
})

describe("groupSessionCountsByProject", () => {
  it("counts sessions per project and includes all bucket", () => {
    const groups = groupSessionCountsByProject(samples)
    expect(groups.all).toBe(3)
    expect(groups.byProject).toEqual([
      { projectId: 10, projectName: "Alpha", count: 2 },
      { projectId: 20, projectName: "Beta", count: 1 },
    ])
  })
})
