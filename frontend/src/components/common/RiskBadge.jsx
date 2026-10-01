import { riskTone } from '../../utils/risk.js'

export function RiskBadge({ score }) {
  const tone = riskTone(score)
  return (
    <span className={`badge ${tone.bg} ${tone.text} border ${tone.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label} · {score}
    </span>
  )
}

export function SeverityPill({ severity }) {
  const map = {
    Critical: 'text-risk-critical bg-risk-criticalSoft border-risk-critical/30',
    High: 'text-risk-high bg-risk-highSoft border-risk-high/30',
    Medium: 'text-risk-medium bg-risk-mediumSoft border-risk-medium/30',
    Low: 'text-risk-low bg-risk-lowSoft border-risk-low/30'
  }
  return <span className={`badge border ${map[severity] || map.Low}`}>{severity}</span>
}
