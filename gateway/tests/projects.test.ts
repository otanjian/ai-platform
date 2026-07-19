import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import fs from "fs/promises"
import os from "os"
import path from "path"
import {
  canEditProject,
  canManageMembers,
  canViewProject,
  isAbsolutePath,
  listProjectPathOptions,
  validateProjectDirectory,
  PROJECT_ROLE_LABELS,
} from "../src/projects"

describe("project helpers", () => {
  let tmpDir: string

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "aiplatform-project-"))
  })

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it("maps roles to Chinese labels", () => {
    expect(PROJECT_ROLE_LABELS.owner).toBe("所有者")
    expect(PROJECT_ROLE_LABELS.admin).toBe("管理员")
    expect(PROJECT_ROLE_LABELS.member).toBe("成员")
    expect(PROJECT_ROLE_LABELS.viewer).toBe("观察者")
  })

  it("detects absolute paths", () => {
    expect(isAbsolutePath("/data/projects/demo")).toBe(true)
    expect(isAbsolutePath("relative/path")).toBe(false)
  })

  it("validates existing directory paths", async () => {
    const ok = await validateProjectDirectory(tmpDir)
    expect(ok.ok).toBe(true)
  })

  it("rejects relative paths", async () => {
    const result = await validateProjectDirectory("not/absolute")
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain("绝对路径")
  })

  it("rejects missing directories", async () => {
    const result = await validateProjectDirectory(path.join(tmpDir, "missing-dir"))
    expect(result.ok).toBe(false)
  })

  it("enforces role capabilities", () => {
    expect(canViewProject("viewer", false)).toBe(true)
    expect(canViewProject(null, false)).toBe(false)
    expect(canViewProject(null, true)).toBe(true)
    expect(canEditProject("member", false)).toBe(false)
    expect(canEditProject("admin", false)).toBe(true)
    expect(canManageMembers("owner", false)).toBe(true)
    expect(canManageMembers("viewer", false)).toBe(false)
    expect(canManageMembers(null, true)).toBe(true)
  })

  it("lists project path options under workspace root", async () => {
    process.env.PROJECT_WORKSPACE_ROOT = tmpDir
    await fs.mkdir(path.join(tmpDir, "demo-a"))
    await fs.mkdir(path.join(tmpDir, "demo-b"))
    const result = await listProjectPathOptions()
    expect(result.workspaceRoot).toBe(tmpDir)
    expect(result.paths.some((p) => p.name === "demo-a")).toBe(true)
    expect(result.paths.some((p) => p.name === "demo-b")).toBe(true)
  })
})
