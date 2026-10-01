import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Fuel, ListChecks, PercentCircle, Radar, ArrowUpRight } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import Layout from '../components/layout/Layout.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import StatCard from '../components/common/StatCard.jsx'
import RiskGauge from '../components/common/RiskGauge.jsx'
import { RiskBadge } from '../components/common/RiskBadge.jsx'
import { severityTone } from '../utils/risk.js'
import api from '../services/api.js'

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [corridors, setCorridors] = useState([])
  const [trend, setTrend] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.getKpis().then(setKpis)
    api.getCorridors().then(setCorridors)
    api.getRiskTrend().then(setTrend)
    api.getLiveEvents().then((e) => setEvents(e.slice(0, 4)))
  }, [])

  return (
    <Layout title="Command overview" subtitle="Live posture across all resilience modules">
      <SectionHeader
        eyebrow="Situation report"
        title="Import supply chain posture"
        description="Real-time synthesis from the Geopolitical Risk Agent, Scenario Modeller, Digital Twin, Reserve Optimizer and Procurement Orchestrator."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Days of cover" value={kpis?.daysOfCover ?? '—'} unit="days" icon={Fuel} accent="cyan" delta="Below 10-day policy floor" deltaTone="up" />
        <StatCard label="Active alerts" value={kpis?.activeAlerts ?? '—'} icon={AlertTriangle} accent="risk" delta="+2 vs. yesterday" deltaTone="up" />
        <StatCard label="Volume share at risk" value={kpis?.affectedVolumeShare ?? '—'} unit="%" icon={PercentCircle} accent="amber" delta="Hormuz + Red Sea corridors" deltaTone="neutral" />
        <StatCard label="Pending recommendations" value={kpis?.pendingRecommendations ?? '—'} icon={ListChecks} accent="low" delta="Awaiting procurement sign-off" deltaTone="neutral" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel p-6 xl:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Radar size={15} className="text-amber" />
            <p className="eyebrow">Geopolitical Risk Agent</p>
          </div>
          <div className="flex justify-center py-2">
            <RiskGauge value={kpis?.globalRiskIndex ?? 0} />
          </div>
          <Link
            to="/risk-intelligence"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-cyan hover:text-cyan/80"
          >
            View corridor breakdown <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="panel p-6 xl:col-span-2">
          <div className="panel-header -mx-6 -mt-6 mb-4 px-6">
            <div>
              <p className="eyebrow">7-day trend</p>
              <p className="text-sm font-medium text-ink-primary">Corridor risk score evolution</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hormuzGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E5484D" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E5484D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="redseaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E2733A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E2733A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
              <XAxis dataKey="day" stroke="#707070" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#707070" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#212121', border: '1px solid #3D3D3D', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Area type="monotone" dataKey="hormuz" name="Hormuz" stroke="#E5484D" fill="url(#hormuzGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="redsea" name="Red Sea" stroke="#E2733A" fill="url(#redseaGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="suez" name="Suez" stroke="#C5A880" fillOpacity={0} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel xl:col-span-2">
          <div className="panel-header">
            <p className="text-sm font-medium text-ink-primary">Corridor risk register</p>
            <Link to="/risk-intelligence" className="text-xs font-medium text-cyan hover:text-cyan/80">
              Full intelligence feed →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {corridors.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink-primary">{c.name}</p>
                  <p className="text-xs text-ink-muted">{c.volumeShare}% of national import volume</p>
                </div>
                <RiskBadge score={c.risk} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel xl:col-span-1">
          <div className="panel-header">
            <p className="text-sm font-medium text-ink-primary">Latest signals</p>
          </div>
          <div className="divide-y divide-border">
            {events.map((e) => {
              const tone = severityTone(e.severity)
              return (
                <div key={e.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    <span className="font-mono text-[11px] text-ink-muted">{e.time}</span>
                    <span className="text-[11px] text-ink-muted">· {e.source}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{e.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
