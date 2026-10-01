# Sentinel Grid — AI-Driven Energy Supply Chain Resilience

A full-stack command-center platform that monitors geopolitical risk to India's crude oil supply chain, models disruption scenarios, simulates the supply network as a digital twin, and recommends reserve and procurement actions.

**Stack:** React 18 (Vite) · Tailwind CSS · Recharts · Node.js + Express · SQLite (built-in `node:sqlite`)

---

## Modules

| Module | Route | What it does |
|---|---|---|
| Command Overview | `/` | KPIs and live corridor-risk ticker across all modules |
| Geopolitical Risk Intelligence Agent | `/risk-intelligence` | Scores chokepoints and shipping routes 0–100; live news feed |
| Disruption Scenario Modeller | `/scenario-modeller` | Models the cascading impact of supply disruptions |
| Supply Chain Digital Twin | `/digital-twin` | Live state of suppliers, routes and ports |
| Strategic Reserve Optimisation Agent | `/reserve-optimizer` | Reserve sites and drawdown projections |
| Adaptive Procurement Orchestrator | `/procurement` | Approve or reject AI-generated procurement recommendations |

## Project structure

```
Energy_Supply_Chain/
├── backend/        Express API, SQLite storage, risk-scoring engine, source CSV datasets
├── frontend/       React (Vite) dashboard
└── README.md
```

Detailed docs: [`backend/README.md`](./backend/README.md) · [`frontend/README.md`](./frontend/README.md)

## Prerequisites

- **Node.js 22.5+** (the backend uses the built-in `node:sqlite` module, so no native compile step)
- npm

> A one-line `ExperimentalWarning: SQLite is an experimental feature` appears on backend startup. It is expected and harmless.

## Quick start

**1. Backend** (terminal 1)

```bash
cd backend
npm install
cp .env.example .env     # optional: add NEWS_API_KEY for live news
npm run seed             # creates data/energy.db and computes risk scores
npm run dev              # http://localhost:5000
```

**2. Frontend** (terminal 2)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the backend on port 5000.

## Configuration

**`backend/.env`**

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Express port (keep in sync with the frontend proxy) |
| `SQLITE_PATH` | `./data/energy.db` | SQLite file location |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed origins |
| `NEWS_API_KEY` | _(empty)_ | [NewsData.io](https://newsdata.io) key for live news (optional) |
| `NEWS_CACHE_TTL_MS` | `600000` | Cache duration for news responses |

**`frontend/.env`**

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | see `.env.example` | Backend API base URL |
| `VITE_USE_MOCK` | `false` | `true` = skip the network and use bundled CSV-derived data |

## Resilient by design

- **No database required to demo:** if SQLite can't be opened, the API serves the same dataset from memory. Check `GET /api/health` for `"dataSource": "sqlite" | "in-memory"`.
- **No API key required:** without `NEWS_API_KEY` (or if the news request fails or is rate-limited), `/api/risk/events` falls back to the seed event timeline.
- **Frontend fallback:** if the backend is unreachable, the UI falls back to bundled data so it stays demoable.

## Risk scoring

`backend/src/services/riskScoringService.js` scores each corridor and route with a transparent, weighted rule-based model (not a trained ML model). It combines:

1. Base criticality of each chokepoint (e.g. Hormuz has no alternative route).
2. Historical events near the chokepoint, weighted by era recency and severity.
3. Live news severity, when `NEWS_API_KEY` is set.

Each route takes the score of the worst chokepoint it transits. Re-run `npm run seed` after editing the CSVs in `backend/dataset/`.

## API overview

| Method | Endpoint |
|---|---|
| GET | `/api/health` |
| GET | `/api/dashboard/kpis` |
| GET | `/api/risk/corridors` · `/trend` · `/events` · `/routes` · `/routes/:id` |
| GET | `/api/scenarios` · `/api/scenarios/:id/impact` |
| GET | `/api/twin/state` |
| GET | `/api/reserves/sites` · `/api/reserves/drawdown` |
| GET | `/api/procurement/recommendations` |
| POST | `/api/procurement/recommendations/:id/approve` · `/reject` |

Full details are in [`backend/README.md`](./backend/README.md).

## Scripts

| Location | Command | Description |
|---|---|---|
| `backend` | `npm run dev` | Start with auto-reload (nodemon) |
| `backend` | `npm start` | Start in production mode |
| `backend` | `npm run seed` | Wipe and repopulate the SQLite database |
| `frontend` | `npm run dev` | Vite dev server |
| `frontend` | `npm run build` | Production build to `dist/` |
| `frontend` | `npm run preview` | Preview the production build |
| `frontend` | `npm run lint` | ESLint |

## Data

Source datasets live in `backend/dataset/` (mirrored in `frontend/src/data/raw/`):

- India crude oil supply
- Supplier infrastructure
- Strategic reserves
- Historical crude prices (monthly)
- Ship routing
- Geopolitical risk events timeline

See `frontend/src/data/DATA_SOURCES.md` for provenance.

## Security notes

- Never commit `.env` files; both are git-ignored. Only the `.env.example` files are tracked.
- Rotate any API key that has ever been shared in plaintext.
