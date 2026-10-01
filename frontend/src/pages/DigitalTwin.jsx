import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Network, FlaskConical, X, TrendingUp, TrendingDown, Factory } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import { riskTone } from '../utils/risk.js'
import api from '../services/api.js'

const statusScore = { critical: 82, high: 60, medium: 40, low: 15 }
const typeShape = {
  supplier: { r: 7, ring: true },
  corridor: { r: 6, ring: false },
  refinery: { r: 8, ring: false },
  reserve: { r: 8, ring: false }
}

// Which digital-twin nodes light up when a given scenario is run from the Scenario Modeller.
const scenarioNodeMap = {
  'hormuz-closure': ['hormuz', 'saudi', 'iraq', 'jamnagar', 'mangalore', 'padur'],
  'redsea-suspension': ['redsea', 'jamnagar', 'mangalore', 'padur'],
  'sanctions-tightening': ['saudi', 'iraq', 'hormuz'],
  'opec-cut': ['saudi', 'iraq', 'usgc']
}

export default function DigitalTwin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const scenarioId = searchParams.get('scenario')

  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [hovered, setHovered] = useState(null)
  const [activeScenario, setActiveScenario] = useState(null)
  const [scenarioImpact, setScenarioImpact] = useState(null)

  useEffect(() => {
    api.getDigitalTwin().then(({ nodes, links }) => {
      setNodes(nodes)
      setLinks(links)
    })
  }, [])

  useEffect(() => {
    if (!scenarioId) {
      setActiveScenario(null)
      setScenarioImpact(null)
      return
    }
    api.getScenarios().then((all) => setActiveScenario(all.find((s) => s.id === scenarioId) || null))
    api.getScenarioImpact(scenarioId).then(setScenarioImpact)
  }, [scenarioId])

  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const affectedIds = scenarioId ? scenarioNodeMap[scenarioId] || [] : []
  const isSimulating = affectedIds.length > 0

  function clearSimulation() {
    setSearchParams({})
  }

  return (
    <Layout title="Supply Chain Digital Twin" subtitle="SCDT · geospatial simulation for continuous what-if analysis">
      <SectionHeader
        eyebrow="Module 03 · SCDT"
        title="Live network simulation"
        description="A geospatial digital twin of suppliers, transit corridors, refineries, and reserves — continuously updated by the Risk Agent and Scenario Modeller."
      />

      {isSimulating && (
        <div className="panel mb-4 flex flex-col gap-4 border-amber/30 bg-amber/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber/15 text-amber">
              <FlaskConical size={16} />
            </div>
            <div>
              <p className="eyebrow">Scenario pushed from DSM</p>
              <p className="text-sm font-medium text-ink-primary">
                {activeScenario ? activeScenario.name : 'Loading scenario…'}
              </p>
              {scenarioImpact && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-secondary">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-risk-critical" /> Price {scenarioImpact.priceImpact}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingDown size={13} className="text-risk-high" /> GDP {scenarioImpact.gdpImpact}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Factory size={13} className="text-risk-medium" /> Refining {scenarioImpact.refiningImpact}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button onClick={clearSimulation} className="btn-secondary shrink-0 !py-1.5 text-xs">
            <X size={14} /> Clear simulation
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel xl:col-span-2">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Network size={16} className="text-cyan" />
              <p className="text-sm font-medium text-ink-primary">Network topology</p>
            </div>
            <Legend />
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-xl bg-bg-soft">
            <div className="grid-backdrop absolute inset-0 opacity-60" />
            <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full">
              {links.map((l, i) => {
                const from = nodeById[l.from]
                const to = nodeById[l.to]
                if (!from || !to) return null
                const linkActive = isSimulating && affectedIds.includes(l.from) && affectedIds.includes(l.to)
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={linkActive ? '#E5484D' : '#3D3D3D'}
                    strokeWidth={linkActive ? '0.6' : '0.35'}
                    strokeDasharray="1.2 1"
                    opacity={isSimulating && !linkActive ? 0.25 : 1}
                  />
                )
              })}
              {nodes.map((n) => {
                const tone = riskTone(statusScore[n.status] ?? 20)
                const shape = typeShape[n.type]
                const isAffected = affectedIds.includes(n.id)
                const dimmed = isSimulating && !isAffected
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x} ${n.y})`}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer', opacity: dimmed ? 0.25 : 1, transition: 'opacity 0.3s ease' }}
                  >
                    {isSimulating && isAffected && (
                      <circle r={shape.r + 5} fill="none" stroke="#E5484D" strokeWidth="0.5" className="animate-pulseDot" />
                    )}
                    {shape.ring && (
                      <circle r={shape.r + 3} fill="none" className={tone.text} stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.4" />
                    )}
                    <circle
                      r={shape.r * 0.55}
                      className={isSimulating && isAffected ? '' : tone.text}
                      fill={isSimulating && isAffected ? '#E5484D' : 'currentColor'}
                    />
                  </g>
                )
              })}
            </svg>

            {hovered && (
              <div
                className="pointer-events-none absolute z-10 rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-xs shadow-panel"
                style={{
                  left: `${hovered.x}%`,
                  top: `${hovered.y}%`,
                  transform: 'translate(-50%, -130%)'
                }}
              >
                <p className="font-medium text-ink-primary">{hovered.label}</p>
                <p className="text-[10px] uppercase tracking-wide text-ink-muted">{hovered.type}</p>
              </div>
            )}
          </div>
        </div>

        <div className="panel xl:col-span-1">
          <div className="panel-header">
            <p className="text-sm font-medium text-ink-primary">Node registry</p>
          </div>
          <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
            {nodes.map((n) => {
              const tone = riskTone(statusScore[n.status] ?? 20)
              const isAffected = affectedIds.includes(n.id)
              const dimmed = isSimulating && !isAffected
              return (
                <div key={n.id} className="flex items-center justify-between px-5 py-3" style={{ opacity: dimmed ? 0.4 : 1 }}>
                  <div>
                    <p className="text-sm text-ink-primary">{n.label}</p>
                    <p className="text-[11px] uppercase tracking-wide text-ink-muted">{n.type}</p>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${isSimulating && isAffected ? 'bg-risk-critical animate-pulseDot' : tone.dot}`} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function Legend() {
  const items = [
    { label: 'Critical', tone: 'bg-risk-critical' },
    { label: 'High', tone: 'bg-risk-high' },
    { label: 'Medium', tone: 'bg-risk-medium' },
    { label: 'Low', tone: 'bg-risk-low' }
  ]
  return (
    <div className="hidden items-center gap-3 sm:flex">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${it.tone}`} />
          <span className="text-[11px] text-ink-muted">{it.label}</span>
        </div>
      ))}
    </div>
  )
}
