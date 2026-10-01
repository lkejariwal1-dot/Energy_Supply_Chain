import { useEffect, useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'

export default function Topbar({ title, subtitle, onMenuClick }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-bg/80 px-4 backdrop-blur lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg border border-border p-2 text-ink-secondary hover:bg-surface-hover lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[17px] font-semibold text-ink-primary">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink-muted">{subtitle}</p>}
      </div>

      <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-ink-muted md:flex">
        <Search size={14} />
        <span className="text-xs">Search corridors, suppliers, routes…</span>
      </div>

      <button
        className="relative rounded-lg border border-border p-2 text-ink-secondary hover:bg-surface-hover"
        aria-label="Alerts"
      >
        <Bell size={17} />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-risk-critical" />
      </button>

      <div className="hidden flex-col items-end sm:flex">
        <span className="font-mono text-xs text-ink-secondary">
          {time.toLocaleTimeString('en-IN', { hour12: false })} IST
        </span>
        <span className="text-[10px] text-ink-muted">
          {time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised border border-border text-xs font-semibold text-ink-secondary">
        OP
      </div>
    </header>
  )
}
