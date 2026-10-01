import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { FlaskConical, TrendingUp, TrendingDown, Factory, Clock, Network } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import { SeverityPill } from '../components/common/RiskBadge.jsx'
import api from '../services/api.js'

export default function ScenarioModeller() {
  const navigate = useNavigate()
  const [scenarios, setScenarios] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [impact, setImpact] = useState(null)

  useEffect(() => {
    api.getScenarios().then((s) => {
      setScenarios(s)
      setActiveId(s[0]?.id)
    })
  }, [])

  useEffect(() => {
    if (activeId) api.getScenarioImpact(activeId).then(setImpact)
  }, [activeId])

  const activeScenario = scenarios.find((s) => s.id === activeId)

  return (
    <Layout title="Disruption Scenario Modeller" subtitle="DSM · simulate cascading impact of supply-corridor events">
      <SectionHeader
        eyebrow="Module 02 · DSM"
        title="Scenario simulation"
        description="Simulates events such as a Hormuz closure or Red Sea suspension and projects their cascading impact on refining throughput, pricing, and GDP — feeding results to the Digital Twin."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel lg:col-span-1">
          <div className="panel-header">
            <p className="text-sm font-medium text-ink-primary">Scenario library</p>
            <FlaskConical size={16} className="text-amber" />
          </div>
          <div className="flex flex-col gap-2 p-3">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  activeId === s.id
                    ? 'border-amber/40 bg-amber/10'
                    : 'border-border bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink-primary">{s.name}</p>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">{s.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <SeverityPill severity={s.severity} />
                  <span className="text-[11px] text-ink-muted">Likelihood: {s.likelihood}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {activeScenario && impact && (
            <>
              <div className="panel p-6">
                <p className="eyebrow">Simulation result</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink-primary">{activeScenario.name}</p>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <ImpactStat icon={TrendingUp} label="Price impact" value={impact.priceImpact} tone="text-risk-critical" />
                  <ImpactStat icon={TrendingDown} label="GDP impact" value={impact.gdpImpact} tone="text-risk-high" />
                  <ImpactStat icon={Factory} label="Refining impact" value={impact.refiningImpact} tone="text-risk-medium" />
                  <ImpactStat icon={Clock} label="Days to stockout" value={impact.daysToStockout} tone="text-cyan" />
                </div>
              </div>

              <div className="panel p-6">
                <p className="eyebrow mb-1">Cascading effect</p>
                <p className="mb-4 text-sm font-medium text-ink-primary">Propagation through the supply network</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={impact.cascade} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#707070" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="stage" type="category" stroke="#9E9E9E" fontSize={12} tickLine={false} axisLine={false} width={140} />
                    <Tooltip contentStyle={{ background: '#212121', border: '1px solid #3D3D3D', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" name="% of normal capacity" fill="#D4AF37" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="panel flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-primary">Push this scenario to the Digital Twin</p>
                  <p className="text-xs text-ink-secondary">
                    Sends the cascading impact projection to update the live network simulation.
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/digital-twin?scenario=${activeScenario.id}`)}
                  className="btn-primary shrink-0"
                >
                  <Network size={15} /> Run in Digital Twin
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

function ImpactStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <Icon size={15} className={tone} />
      <p className={`stat-figure mt-2 text-xl ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{label}</p>
    </div>
  )
}
