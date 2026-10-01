import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { Radar, Ship, FileWarning, Newspaper } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import { RiskBadge } from '../components/common/RiskBadge.jsx'
import RouteRiskChecker from '../components/common/RouteRiskChecker.jsx'
import { severityTone } from '../utils/risk.js'
import api from '../services/api.js'

const sourceIcon = { 'AIS Feed': Ship, 'Sanctions Feed': FileWarning, 'News Wire': Newspaper }

export default function RiskIntelligence() {
  const [corridors, setCorridors] = useState([])
  const [trend, setTrend] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.getCorridors().then(setCorridors)
    api.getRiskTrend().then(setTrend)
    api.getLiveEvents().then(setEvents)
  }, [])

  return (
    <Layout title="Geopolitical Risk Intelligence" subtitle="GRIA · live disruption-probability scoring by corridor and supplier">
      <SectionHeader
        eyebrow="Module 01 · GRIA"
        title="Corridor & supplier risk intelligence"
        description="Ingests news, AIS shipping positions, and sanctions data to produce a live supply-disruption probability score, published continuously to the Digital Twin."
      />

      <div className="mb-4">
        <RouteRiskChecker />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Corridor scores</p>
              <p className="text-sm font-medium text-ink-primary">Ranked by disruption probability</p>
            </div>
            <Radar size={16} className="text-amber" />
          </div>
          <div className="divide-y divide-border">
            {corridors
              .slice()
              .sort((a, b) => b.risk - a.risk)
              .map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-primary">{c.name}</p>
                    <p className="text-xs text-ink-muted">{c.volumeShare}% of import volume transits this corridor</p>
                    {c.topEvents?.length > 0 && (
                      <p className="mt-1 text-[11px] text-ink-muted">
                        Driven by: {c.topEvents.slice(0, 2).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="hidden w-40 sm:block">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full ${
                          c.risk >= 70 ? 'bg-risk-critical' : c.risk >= 50 ? 'bg-risk-high' : c.risk >= 25 ? 'bg-risk-medium' : 'bg-risk-low'
                        }`}
                        style={{ width: `${c.risk}%` }}
                      />
                    </div>
                  </div>
                  <RiskBadge score={c.risk} />
                </div>
              ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <p className="text-sm font-medium text-ink-primary">Live signal feed</p>
          </div>
          <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
            {events.map((e) => {
              const tone = severityTone(e.severity)
              const Icon = sourceIcon[e.source] || Newspaper
              return (
                <div key={e.id} className="flex gap-3 px-5 py-3.5">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone.bg} ${tone.text}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-muted">{e.time}</span>
                      <span className="text-[11px] text-ink-muted">{e.source}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{e.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="panel mt-4 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">Trend analysis</p>
            <p className="text-sm font-medium text-ink-primary">7-day corridor risk trajectory</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
            <XAxis dataKey="day" stroke="#707070" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#707070" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#212121', border: '1px solid #3D3D3D', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9E9E9E' }} />
            <Line type="monotone" dataKey="hormuz" name="Hormuz" stroke="#E5484D" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="redsea" name="Red Sea" stroke="#E2733A" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="suez" name="Suez" stroke="#C5A880" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  )
}
