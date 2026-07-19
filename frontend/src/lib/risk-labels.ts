export type RiskLabel = 'critical' | 'high' | 'medium' | 'low'

const RISK_META: Record<RiskLabel, { label: string; className: string }> = {
  critical: { label: '严重', className: 'bg-red-100 text-red-800 ring-red-200' },
  high: { label: '高', className: 'bg-orange-100 text-orange-800 ring-orange-200' },
  medium: { label: '中', className: 'bg-amber-100 text-amber-900 ring-amber-200' },
  low: { label: '低', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
}

export function riskChipMeta(risk: string): { label: string; className: string } {
  if (risk in RISK_META) return RISK_META[risk as RiskLabel]
  return { label: risk, className: 'bg-slate-100 text-slate-700 ring-slate-200' }
}
