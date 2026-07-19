export type GithubWorkflowTriggers = {
  issueComment: boolean
  pullRequest: boolean
  pullRequestReviewComment: boolean
}

export function parseGithubWorkflowTriggers(query: Record<string, string | undefined>): GithubWorkflowTriggers {
  const flag = (v: string | undefined, defaultValue: boolean) => {
    if (v === undefined || v === "") return defaultValue
    return v === "1" || v === "true" || v === "yes"
  }
  return {
    issueComment: flag(query.issueComment, true),
    pullRequest: flag(query.pullRequest, false),
    pullRequestReviewComment: flag(query.pullRequestReviewComment, false),
  }
}

export function buildGithubWorkflowYaml(triggers: GithubWorkflowTriggers): string {
  const onLines: string[] = []
  if (triggers.issueComment) {
    onLines.push("  issue_comment:")
    onLines.push("    types: [created]")
  }
  if (triggers.pullRequest) {
    onLines.push("  pull_request:")
    onLines.push("    types: [opened, synchronize, reopened]")
  }
  if (triggers.pullRequestReviewComment) {
    onLines.push("  pull_request_review_comment:")
    onLines.push("    types: [created]")
  }
  if (onLines.length === 0) {
    onLines.push("  workflow_dispatch:")
  }

  return `name: opencode

on:
${onLines.join("\n")}

jobs:
  opencode:
    if: |
      github.event_name == 'workflow_dispatch' ||
      contains(github.event.comment.body, ' /oc') ||
      startsWith(github.event.comment.body, '/oc') ||
      contains(github.event.comment.body, ' /opencode') ||
      startsWith(github.event.comment.body, '/opencode') ||
      contains(github.event.comment.body, ' /review') ||
      startsWith(github.event.comment.body, '/review')
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
      pull-requests: write
      issues: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run OpenCode
        uses: sst/opencode/github@latest
        env:
          OPENCODE_API_KEY: \${{ secrets.OPENCODE_API_KEY }}
`
}