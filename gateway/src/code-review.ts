export type ReviewPart = {
  type?: string
  text?: string
  [key: string]: unknown
}

export type ReviewCommandResult = {
  info?: unknown
  parts?: ReviewPart[]
}

export type RiskLabel = "critical" | "high" | "medium" | "low"

const RISK_PATTERNS: Array<{ label: RiskLabel; re: RegExp }> = [
  { label: "critical", re: /\bcritical\b|严重|致命/i },
  { label: "high", re: /\bhigh\b|高风险|高危/i },
  { label: "medium", re: /\bmedium\b|中风险|中危/i },
  { label: "low", re: /\blow\b|低风险|低危/i },
]

export function extractRiskLabels(text: string): RiskLabel[] {
  const found: RiskLabel[] = []
  for (const { label, re } of RISK_PATTERNS) {
    if (re.test(text) && !found.includes(label)) found.push(label)
  }
  return found
}

export function parseReviewResult(payload: ReviewCommandResult): {
  text: string
  risks: RiskLabel[]
  parts: ReviewPart[]
} {
  const parts = Array.isArray(payload?.parts) ? payload.parts : []
  const text = parts
    .filter((p) => p?.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("")
  return {
    text,
    risks: extractRiskLabels(text),
    parts,
  }
}
