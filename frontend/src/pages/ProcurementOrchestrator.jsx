import { useEffect, useState } from 'react'
import { ShoppingCart, Check, X, Ship } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import { RiskBadge } from '../components/common/RiskBadge.jsx'
import api from '../services/api.js'

export default function ProcurementOrchestrator() {
  const [rows, setRows] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    api.getProcurementRecommendations().then(setRows)
  }, [])

  async function handleDecision(id, decision) {
    setBusyId(id)
    setActionError(null)
    try {
      const action = decision === 'approved' ? api.approveRecommendation : api.rejectRecommendation
      const result = await action(id)
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: result.status } : r)))
    } catch (err) {
      console.error(`Failed to ${decision === 'approved' ? 'approve' : 'reject'} ${id}:`, err)
      setActionError(`Couldn't record that decision for ${id}. Please try again.`)
    } finally {
      setBusyId(null)
    }
  }

  const pending = rows.filter((r) => r.status === 'pending').length

  return (
    <Layout title="Adaptive Procurement Orchestrator" subtitle="APO · ranked rerouting recommendations for procurement teams">
      <SectionHeader
        eyebrow="Module 05 · APO"
        title="Rerouting recommendations"
        description="Ranks alternative crude sources and logistics routes using the Digital Twin's network state and the Reserve Optimizer's contribution, giving procurement teams an executable plan within hours."
        action={
          <span className="badge border border-amber/30 bg-amber/10 text-amber">
            {pending} awaiting decision
          </span>
        }
      />

      <div className="panel overflow-hidden">
        {actionError && (
          <div className="border-b border-risk-critical/30 bg-risk-criticalSoft px-5 py-2.5 text-xs text-risk-critical">
            {actionError}
          </div>
        )}
        <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.9fr_0.8fr_1fr] gap-3 border-b border-border bg-surface-raised px-5 py-3 text-[11px] uppercase tracking-wide text-ink-muted lg:grid">
          <span>Source & route</span>
          <span>Volume</span>
          <span>ETA</span>
          <span>Cost delta</span>
          <span>Route risk</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.9fr_0.8fr_1fr] lg:items-center"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                  <Ship size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-primary">{r.source}</p>
                  <p className="text-xs text-ink-muted">{r.route}</p>
                  <p className="font-mono text-[10px] text-ink-muted">{r.id}</p>
                </div>
              </div>

              <div className="stat-figure text-sm text-ink-primary">{r.volume}</div>
              <div className="stat-figure text-sm text-ink-primary">{r.etaDays}d</div>
              <div className="stat-figure text-sm text-risk-high">{r.costDelta}</div>
              <div><RiskBadge score={r.riskScore} /></div>

              <div>
                <StatusPill status={r.status} />
              </div>

              <div className="flex justify-start gap-2 lg:justify-end">
                {r.status === 'pending' ? (
                  <>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleDecision(r.id, 'approved')}
                      className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-50"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleDecision(r.id, 'rejected')}
                      className="btn-ghost-danger !px-3 !py-1.5 text-xs disabled:opacity-50"
                    >
                      <X size={14} /> Reject
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-ink-muted">Decision recorded</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
        <ShoppingCart size={14} />
        Approved recommendations are dispatched to refiners and logistics providers, with execution status fed back
        into the Digital Twin.
      </div>
    </Layout>
  )
}

function StatusPill({ status }) {
  const map = {
    pending: 'text-risk-medium bg-risk-mediumSoft border-risk-medium/30',
    approved: 'text-risk-low bg-risk-lowSoft border-risk-low/30',
    rejected: 'text-risk-critical bg-risk-criticalSoft border-risk-critical/30'
  }
  return <span className={`badge border ${map[status]}`}>{status}</span>
}
