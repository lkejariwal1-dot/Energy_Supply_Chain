import { riskTone } from '../../utils/risk.js'

export default function AlertTicker({ corridors }) {
  const items = [...corridors, ...corridors] // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden border-b border-border bg-bg-soft">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg-soft to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg-soft to-transparent" />
      <div className="flex w-max animate-ticker items-center gap-8 whitespace-nowrap py-2 pl-4">
        {items.map((c, i) => {
          const tone = riskTone(c.risk)
          return (
            <div key={`${c.id}-${i}`} className="flex items-center gap-2 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
              <span className="font-medium text-ink-secondary">{c.name}</span>
              <span className={`font-mono font-semibold ${tone.text}`}>{c.risk}</span>
              <span className="text-ink-muted">
                {c.trend === 'up' ? '▲' : c.trend === 'down' ? '▼' : '—'}
              </span>
              <span className="text-border-strong">/</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
