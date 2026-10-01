// Central mapping from a 0-100 risk score (or a severity label) to design tokens.
export function riskTone(score) {
  if (score >= 70) {
    return { label: 'Critical', text: 'text-risk-critical', dot: 'bg-risk-critical', bg: 'bg-risk-criticalSoft', border: 'border-risk-critical/30' }
  }
  if (score >= 50) {
    return { label: 'High', text: 'text-risk-high', dot: 'bg-risk-high', bg: 'bg-risk-highSoft', border: 'border-risk-high/30' }
  }
  if (score >= 25) {
    return { label: 'Medium', text: 'text-risk-medium', dot: 'bg-risk-medium', bg: 'bg-risk-mediumSoft', border: 'border-risk-medium/30' }
  }
  return { label: 'Low', text: 'text-risk-low', dot: 'bg-risk-low', bg: 'bg-risk-lowSoft', border: 'border-risk-low/30' }
}

export function severityTone(severity) {
  const map = {
    critical: { text: 'text-risk-critical', dot: 'bg-risk-critical', bg: 'bg-risk-criticalSoft', border: 'border-risk-critical/30' },
    high: { text: 'text-risk-high', dot: 'bg-risk-high', bg: 'bg-risk-highSoft', border: 'border-risk-high/30' },
    medium: { text: 'text-risk-medium', dot: 'bg-risk-medium', bg: 'bg-risk-mediumSoft', border: 'border-risk-medium/30' },
    low: { text: 'text-risk-low', dot: 'bg-risk-low', bg: 'bg-risk-lowSoft', border: 'border-risk-low/30' }
  }
  return map[severity] || map.low
}
