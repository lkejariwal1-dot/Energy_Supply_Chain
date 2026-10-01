import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts'
import { Fuel } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import api from '../services/api.js'

export default function ReserveOptimizer() {
  const [sites, setSites] = useState([])
  const [schedule, setSchedule] = useState([])

  useEffect(() => {
    api.getReserveSites().then(setSites)
    api.getDrawdownSchedule().then(setSchedule)
  }, [])

  return (
    <Layout title="Strategic Reserve Optimization" subtitle="SROA · optimal drawdown scheduling against supply gap forecasts">
      <SectionHeader
        eyebrow="Module 04 · SROA"
        title="Reserve drawdown optimization"
        description="Models optimal strategic reserve drawdown schedules against the Digital Twin's supply gap forecast, extending national days-of-cover during a disruption."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sites.map((s) => (
          <div key={s.id} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{s.name}</p>
              <Fuel size={15} className="text-cyan" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="stat-figure text-2xl text-ink-primary">{s.level}</span>
              <span className="text-sm text-ink-muted">% full</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-cyan" style={{ width: `${s.level}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-ink-muted">{s.capacity} MMbbl nameplate capacity</p>
          </div>
        ))}
      </div>

      <div className="panel mt-4 p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">6-week projection</p>
            <p className="text-sm font-medium text-ink-primary">Days-of-cover: baseline vs. optimized drawdown</p>
          </div>
          <span className="badge border border-risk-high/30 bg-risk-highSoft text-risk-high w-fit">
            9.5-day policy floor
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={schedule} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
            <XAxis dataKey="week" stroke="#707070" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#707070" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Days of cover', angle: -90, position: 'insideLeft', fill: '#707070', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#212121', border: '1px solid #3D3D3D', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9E9E9E' }} />
            <ReferenceLine y={9.5} stroke="#E2733A" strokeDasharray="4 4" label={{ value: 'Policy floor', fill: '#E2733A', fontSize: 11, position: 'right' }} />
            <Line type="monotone" dataKey="projected" name="Unmanaged drawdown" stroke="#707070" strokeWidth={2} strokeDasharray="4 3" dot={false} />
            <Line type="monotone" dataKey="optimized" name="SROA-optimized" stroke="#C5A880" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-4 text-xs text-ink-secondary">
          The optimized schedule staggers drawdown across Visakhapatnam, Mangalore and Padur to preserve strategic
          flexibility, extending the runway before the policy floor is breached by roughly two weeks versus an
          unmanaged drawdown.
        </p>
      </div>
    </Layout>
  )
}
