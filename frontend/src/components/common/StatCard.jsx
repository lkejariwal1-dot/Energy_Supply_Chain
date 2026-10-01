export default function StatCard({ label, value, unit, delta, deltaTone = 'neutral', icon: Icon, accent = 'amber' }) {
  const accentMap = {
    amber: 'bg-amber/15 text-amber',
    cyan: 'bg-cyan/15 text-cyan',
    risk: 'bg-risk-criticalSoft text-risk-critical',
    low: 'bg-risk-lowSoft text-risk-low'
  }

  const deltaMap = {
    up: 'text-risk-critical',
    down: 'text-risk-low',
    neutral: 'text-ink-muted'
  }

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between">
        <p className="eyebrow">{label}</p>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentMap[accent]}`}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="stat-figure text-3xl text-ink-primary">{value}</span>
        {unit && <span className="text-sm text-ink-muted">{unit}</span>}
      </div>
      {delta && <p className={`mt-1.5 text-xs font-medium ${deltaMap[deltaTone]}`}>{delta}</p>}
    </div>
  )
}
