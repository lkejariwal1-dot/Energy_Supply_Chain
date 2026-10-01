import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Radar,
  FlaskConical,
  Network,
  Fuel,
  ShoppingCart,
  Satellite
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/risk-intelligence', label: 'Geopolitical Risk', icon: Radar, tag: 'GRIA' },
  { to: '/scenario-modeller', label: 'Scenario Modeller', icon: FlaskConical, tag: 'DSM' },
  { to: '/digital-twin', label: 'Digital Twin', icon: Network, tag: 'SCDT' },
  { to: '/reserve-optimizer', label: 'Reserve Optimizer', icon: Fuel, tag: 'SROA' },
  { to: '/procurement', label: 'Procurement Orchestrator', icon: ShoppingCart, tag: 'APO' }
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-72 shrink-0 border-r border-border bg-surface/95 backdrop-blur
        transform transition-transform duration-200 lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/15 text-amber">
            <Satellite size={18} strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold text-ink-primary">Sentinel Grid</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Energy resilience OS
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          <p className="eyebrow px-3 pb-2">Command modules</p>
          {navItems.map(({ to, label, icon: Icon, tag, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition
                ${
                  isActive
                    ? 'bg-amber/10 text-amber border border-amber/25'
                    : 'text-ink-secondary border border-transparent hover:bg-surface-hover hover:text-ink-primary'
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              <span className="flex-1 font-medium">{label}</span>
              {tag && (
                <span className="font-mono text-[10px] text-ink-muted group-hover:text-ink-secondary">
                  {tag}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-risk-low" />
            </span>
            <p className="text-xs text-ink-secondary">
              All feeds nominal <span className="text-ink-muted">· synced 12s ago</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
