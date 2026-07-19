import { describe, expect, it } from "bun:test"
import { extractRiskLabels, parseReviewResult } from "../src/code-review"
import { buildGithubWorkflowYaml, type GithubWorkflowTriggers } from "../src/github-workflow"

describe("parseReviewResult", () => {
  it("joins text parts into body", () => {
    const result = parseReviewResult({
      info: { id: "msg_1" },
      parts: [
        { type: "text", text: "Finding A\n" },
        { type: "text", text: "Finding B" },
        { type: "tool", name: "bash" },
      ],
    })
    expect(result.text).toBe("Finding A\nFinding B")
  })

  it("returns empty text when no text parts", () => {
    const result = parseReviewResult({ parts: [{ type: "step-start" }] })
    expect(result.text).toBe("")
  })
})

describe("extractRiskLabels", () => {
  it("detects english and chinese risk keywords", () => {
    const labels = extractRiskLabels("Critical issue and 中风险 also low severity")
    expect(labels).toContain("critical")
    expect(labels).toContain("medium")
    expect(labels).toContain("low")
  })

  it("deduplicates labels", () => {
    const labels = extractRiskLabels("high risk HIGH 高风险")
    expect(labels.filter((l) => l === "high")).toHaveLength(1)
  })
})

describe("buildGithubWorkflowYaml", () => {
  const base: GithubWorkflowTriggers = {
    issueComment: true,
    pullRequest: false,
    pullRequestReviewComment: false,
  }

  it("includes issue_comment trigger by default template", () => {
    const yaml = buildGithubWorkflowYaml(base)
    expect(yaml).toContain("name: opencode")
    expect(yaml).toContain("issue_comment:")
    expect(yaml).toContain("sst/opencode/github@latest")
    expect(yaml).not.toContain("pull_request:")
  })

  it("adds pull_request when enabled", () => {
    const yaml = buildGithubWorkflowYaml({ ...base, pullRequest: true })
    expect(yaml).toContain("pull_request:")
  })

  it("adds pull_request_review_comment when enabled", () => {
    const yaml = buildGithubWorkflowYaml({ ...base, pullRequestReviewComment: true })
    expect(yaml).toContain("pull_request_review_comment:")
  })
})
