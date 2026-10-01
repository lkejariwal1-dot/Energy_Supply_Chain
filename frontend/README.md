# Sentinel Grid — Frontend

React (Vite) frontend for the **AI-Driven Energy Supply Chain Resilience** platform. This is the client half of a
MERN stack app: it's built to sit in front of an Express + Node.js + MongoDB API and mirrors the five modules from
the system's sequence diagram.

## Module → page map

| Module (sequence diagram) | Route | File |
|---|---|---|
| Geopolitical Risk Intelligence Agent (GRIA) | `/risk-intelligence` | `src/pages/RiskIntelligence.jsx` |
| Disruption Scenario Modeller (DSM) | `/scenario-modeller` | `src/pages/ScenarioModeller.jsx` |
| Supply Chain Digital Twin (SCDT) | `/digital-twin` | `src/pages/DigitalTwin.jsx` |
| Strategic Reserve Optimisation Agent (SROA) | `/reserve-optimizer` | `src/pages/ReserveOptimizer.jsx` |
| Adaptive Procurement Orchestrator (APO) | `/procurement` | `src/pages/ProcurementOrchestrator.jsx` |
| Command overview (all modules) | `/` | `src/pages/Dashboard.jsx` |

## Getting started

```bash
npm install   # point VITE_API_URL at your Express backend
npm run dev             # http://localhost:5173
```

```bash
npm run build            # production build to /dist
npm run preview          # preview the production build locally
```

## Backend

The matching Express/Node + MongoDB API now lives in [`backend/`](./backend/README.md). It implements every route
this frontend expects, with response shapes matching `src/data/supplyChainData.js` exactly:

- `GET /api/risk/corridors`, `GET /api/risk/trend`, `GET /api/risk/events`
- `GET /api/scenarios`, `GET /api/scenarios/:id/impact`
- `GET /api/twin/state`
- `GET /api/reserves/sites`, `GET /api/reserves/drawdown`
- `GET /api/procurement/recommendations`, `POST /api/procurement/recommendations/:id/approve|reject`
- `GET /api/dashboard/kpis`

It works out of the box with **no MongoDB required** — if `MONGO_URI` isn't set or isn't reachable, it
automatically serves the same demo dataset from memory. See `backend/README.md` for the full setup, and
`GET /api/health` to check whether it's running in `mongodb` or `in-memory` mode.

### Running both together

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env
npm run dev              # http://localhost:5000

# Terminal 2 — frontend
npm install
npm run dev              # http://localhost:5173
```

`vite.config.js` already proxies `/api` to `http://localhost:5000` in dev, matching the backend's default port.
`src/services/api.js` controls the mock/live switch via `VITE_USE_MOCK` in `.env`:

- `VITE_USE_MOCK=false` (default) — calls the real backend above, falling back to the bundled CSV-derived data
  in `src/data/supplyChainData.js` only if a request fails (so the UI stays demoable even if the backend is down).
- `VITE_USE_MOCK=true` — skips the network entirely and always uses the bundled data.

## Stack

- **React 18** + **React Router 6**
- **Tailwind CSS** — custom dark "command center" design system (see `tailwind.config.js`)
- **Recharts** — trend lines, cascade bars, drawdown projections
- **lucide-react** — icon set
- **axios** — HTTP client, pre-wired in `src/services/api.js`

## Project structure

```
src/
  components/
    layout/       Sidebar, Topbar, Layout shell
    common/        StatCard, RiskBadge, RiskGauge, AlertTicker, SectionHeader
  pages/           One page per module (see table above)
  data/            Mock data matching the eventual MongoDB shape
  services/        api.js — axios client + mock fallback
  utils/           risk.js — shared risk-score → color/label mapping
```

## Design notes

Dark "energy operations command center" aesthetic: navy/charcoal surfaces, amber (crude/energy) and cyan
(data/digital twin) accents, monospace figures for data readouts, and a live scrolling corridor-risk ticker as the
signature element. Fully responsive: collapsible sidebar on mobile/tablet, stacked grids down to small screens.
