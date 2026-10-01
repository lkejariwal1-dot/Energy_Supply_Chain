import { useEffect, useMemo, useState } from 'react'
import { Ship, ArrowRight, Search, AlertTriangle } from 'lucide-react'
import { RiskBadge } from './RiskBadge.jsx'
import api from '../../services/api.js'

const CHOKEPOINT_LABEL = {
  hormuz: 'Strait of Hormuz',
  redsea: 'Red Sea / Bab-el-Mandeb',
  suez: 'Suez Canal',
  malacca: 'Strait of Malacca',
  capegood: 'Cape of Good Hope',
  panama: 'Panama Canal'
}

export default function RouteRiskChecker() {
  const [ports, setPorts] = useState([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [results, setResults] = useState(null) // null = no search yet
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getRoutePorts().then(setPorts)
  }, [])

  const destinationOptions = useMemo(() => ports.filter((p) => p.port !== origin), [ports, origin])

  async function handleCheck() {
    if (!origin || !destination) return
    setLoading(true)
    try {
      const rows = await api.searchRoutes({ origin, destination })
      setResults(rows)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Route risk checker</p>
          <p className="text-sm font-medium text-ink-primary">Pick a route, get a live risk read</p>
        </div>
        <Ship size={16} className="text-cyan" />
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
          <select
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value)
              setResults(null)
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-cyan focus:outline-none"
          >
            <option value="">Origin port…</option>
            {ports.map((p) => (
              <option key={p.port} value={p.port}>
                {p.port} ({p.country})
              </option>
            ))}
          </select>

          <div className="hidden items-center justify-center sm:flex">
            <ArrowRight size={16} className="text-ink-muted" />
          </div>

          <select
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value)
              setResults(null)
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-cyan focus:outline-none"
          >
            <option value="">Destination port…</option>
            {destinationOptions.map((p) => (
              <option key={p.port} value={p.port}>
                {p.port} ({p.country})
              </option>
            ))}
          </select>

          <button
            onClick={handleCheck}
            disabled={!origin || !destination || loading}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-bg transition hover:bg-cyan/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Search size={14} />
            {loading ? 'Checking…' : 'Check risk'}
          </button>
        </div>

        {results !== null && (
          <div className="mt-5 space-y-3">
            {results.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
                <AlertTriangle size={14} />
                No direct route found between these ports in the dataset. Try a different pair, or check nearby
                hub ports.
              </div>
            )}

            {results.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      {r.originPort} → {r.destPort}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {r.tradeLane} · {r.distanceNm.toLocaleString()} nm · ~{r.transitDays} days transit
                      {r.canalRoute !== 'None' && ` · via ${r.canalRoute}`}
                    </p>
                  </div>
                  <RiskBadge score={r.riskScore} />
                </div>

                {r.chokepoints.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.chokepoints.map((cp) => (
                      <span
                        key={cp}
                        className="rounded-md border border-border bg-bg-soft px-2 py-1 text-[11px] text-ink-secondary"
                      >
                        Transits {CHOKEPOINT_LABEL[cp] || cp}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[11px] text-ink-muted">
                    No major geopolitical chokepoint on this route — open-ocean baseline risk only.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
