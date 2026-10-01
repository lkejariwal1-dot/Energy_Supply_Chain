import { useEffect, useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import AlertTicker from '../common/AlertTicker.jsx'
import api from '../../services/api.js'

export default function Layout({ title, subtitle, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [corridors, setCorridors] = useState([])

  useEffect(() => {
    api.getCorridors().then(setCorridors)
  }, [])

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setMenuOpen(true)} />
        <AlertTicker corridors={corridors} />

        <main className="grid-backdrop flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>

        <footer className="border-t border-border px-4 py-4 text-center text-[11px] text-ink-muted lg:px-8">
          Sentinel Grid - AI-driven energy supply chain resilience ·
        </footer>
      </div>
    </div>
  )
}
