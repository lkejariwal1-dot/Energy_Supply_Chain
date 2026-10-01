# Sentinel Grid — Backend

Express + Node.js API for the **AI-Driven Energy Supply Chain Resilience** platform. This is the server half of
the MERN stack referenced by the frontend's `src/services/api.js`, `vite.config.js` proxy, and root `README.md`.

It implements exactly the routes the frontend already expects, with response shapes matching
`src/data/supplyChainData.js` in the frontend 1:1:

| Method | Route | Module |
|---|---|---|
| GET | `/api/risk/corridors` | Geopolitical Risk Intelligence Agent |
| GET | `/api/risk/trend` | Geopolitical Risk Intelligence Agent |
| GET | `/api/risk/events` | Geopolitical Risk Intelligence Agent |
| GET | `/api/scenarios` | Disruption Scenario Modeller |
| GET | `/api/scenarios/:id/impact` | Disruption Scenario Modeller |
| GET | `/api/twin/state` | Supply Chain Digital Twin |
| GET | `/api/reserves/sites` | Strategic Reserve Optimisation Agent |
| GET | `/api/reserves/drawdown` | Strategic Reserve Optimisation Agent |
| GET | `/api/procurement/recommendations` | Adaptive Procurement Orchestrator |
| POST | `/api/procurement/recommendations/:id/approve` | Adaptive Procurement Orchestrator |
| POST | `/api/procurement/recommendations/:id/reject` | Adaptive Procurement Orchestrator |
| GET | `/api/risk/routes` | Geopolitical Risk Intelligence Agent — every shipping route scored 0-100 (`?corridor=hormuz`, `?minRisk=50`) |
| GET | `/api/risk/routes/:id` | Geopolitical Risk Intelligence Agent — single route |
| GET | `/api/dashboard/kpis` | Command overview |
| GET | `/api/health` | Server / data-source status |

## Design: works with or without SQLite

The server is intentionally resilient so it never crashes just because the database can't be opened:

- On boot it opens (or creates) the local SQLite file at `SQLITE_PATH` (default `./data/energy.db`).
- If the file can't be opened for some reason (bad permissions, missing native binary, corrupt file), it logs
  a warning and **automatically serves the same demo dataset from memory** (`src/data/seedData.js`) instead of
  failing.
- `GET /api/health` reports which mode it's in (`"dataSource": "sqlite" | "in-memory"`).
- Approve/reject actions on procurement recommendations work in both modes (writing to SQLite when connected,
  or an in-memory copy otherwise).

Unlike MongoDB, SQLite needs no separate server process — it's just a file, created automatically on first
run. This project uses Node's own built-in `node:sqlite` module (no external dependency, no native compile
step — the classic cause of `npm install` failures with `better-sqlite3`/`sqlite3` on Windows). Requires
Node.js 22.5+; you'll see a one-line `ExperimentalWarning: SQLite is an experimental feature` on startup —
that's expected and harmless. `npm run dev` works immediately, and `npm run seed` (re)populates the database
file, including recomputing the corridor and route risk scores from the datasets in `dataset/`.

## Route risk scoring (Geopolitical Risk Intelligence Agent)

`src/services/riskScoringService.js` scores every corridor and shipping route (`dataset/ship_routing.csv`)
0-100. This is a transparent, weighted rule-based scorer rather than a trained ML model — the historical
events dataset only has ~124 real dated rows spanning 1648-2026 with no numeric risk labels, which isn't
enough to fit a supervised model against. It combines:

1. A base criticality per chokepoint (Hormuz has no alternative route; Cape of Good Hope is itself a reroute).
2. Historical events near that chokepoint (`dataset/geopolitical_risk_events_timeline.csv`), weighted by how
   recent the event's era is (the dataset's own `Era` field) and how severe its language is.
3. Live news, when `NEWS_API_KEY` is configured, using the same keyword severity classifier as
   `newsService.js`.

Each route is scored by the worst of the chokepoint(s) it transits, inferred from `Canal_Route` plus
origin/destination ports. `npm run seed` recomputes these scores and writes them into the `corridors` and
`routes` tables; restart the server or re-seed after editing the CSVs in `dataset/` to pick up changes.

## Live news feed (Geopolitical Risk Intelligence Agent)

`GET /api/risk/events` can be backed by real news instead of only the static seed timeline. Set `NEWS_API_KEY`
in `.env` to a [NewsData.io](https://newsdata.io) API key (a `.env` with the key you gave me is already included
in this delivery — **rotate/regenerate it before sharing this project publicly or committing it to a public
repo**, since it was pasted in plaintext in chat).

`src/services/newsService.js` (`fetchLiveGeopoliticalEvents`) queries NewsData.io for crude-oil/chokepoint/
sanctions coverage, tags each article with a severity (`critical` / `high` / `medium`) based on keyword
matching, and reshapes it into the same `{ id, time, severity, source, text }` shape the frontend already
renders. It never throws — every failure mode is handled and falls back to the seed/DB event timeline instead:

| Failure | Behavior |
|---|---|
| `NEWS_API_KEY` unset | Logs one warning, skips the live fetch, serves seed/DB events |
| Request times out (>8s) | Logged, falls back to seed/DB events |
| Network error | Logged, falls back to seed/DB events |
| `401`/`403` (bad key) | Logged as an error, falls back to seed/DB events |
| `429` (rate limited) | Serves the last successful response from cache if one exists, else falls back |
| Non-2xx / malformed JSON | Logged, falls back to seed/DB events |
| `0` matching articles | Logged, falls back to seed/DB events |

Successful responses are cached in memory for `NEWS_CACHE_TTL_MS` (default 10 minutes) so repeated dashboard
polling doesn't burn through the free-tier rate limit. `GET /api/health` reports `"newsFeed": "newsdata.io"` or
`"seed-data-only"` depending on whether a key is configured.

## Getting started

```bash
cd backend
npm install
cp .env.example .env      # adjust PORT / SQLITE_PATH / CORS_ORIGIN as needed
npm run seed                # creates data/energy.db and populates it (incl. computed risk scores)
npm run dev                 # http://localhost:5000, auto-restarts on changes (nodemon)
```

`npm run seed` is optional — if you skip it, the server still runs fine in in-memory mode. But run it once to
get a real local SQLite file with the demo data and computed route/corridor risk scores.

The frontend's Vite dev server proxy (`/api` → `http://localhost:5000`) will reach this API once you also
have `VITE_USE_MOCK=false` (the default) in the frontend's `.env`.

### SQLite file location

By default the database lives at `backend/data/energy.db`. To point at a different file (e.g. one you
already use elsewhere on your machine), set `SQLITE_PATH` in `.env` — either a path relative to `backend/`
or an absolute path — then run `npm run seed` again to populate it.

## Project structure

```
backend/
  server.js               Entry point — connects DB, starts Express
  src/
    app.js                 Express app: CORS, JSON body parsing, routes, error handling
    config/db.js            SQLite connection (built-in node:sqlite) + in-memory fallback flag
    db/schema.js             CREATE TABLE statements, one table per collection
    controllers/             Route handlers — read from SQLite or in-memory data depending on dbState
    routes/                  Express routers, mounted under /api/* in app.js
    services/
      newsService.js          Live news client (NewsData.io) + severity keyword classifier
      riskScoringService.js    Corridor/route risk scoring engine (reads dataset/*.csv)
    utils/csv.js              Tiny CSV parser used by riskScoringService
    middleware/               404 + centralized error handler
    data/
      seedData.js              Source-of-truth demo dataset (mirrors frontend's supplyChainData.js)
  dataset/                  Source CSVs (reserves, prices, routes, suppliers, geopolitical timeline)
  scripts/seed.js           One-off script: wipes + repopulates data/energy.db from seedData.js + computed risk
```

## Environment variables

See `.env.example`:

- `PORT` — port Express listens on (default `5000`, matches the frontend's Vite proxy target).
- `SQLITE_PATH` — path to the local SQLite file (default `./data/energy.db`, relative to `backend/`). Omit to
  use the default; the file and its parent folder are created automatically. Point this at an existing
  SQLite database on your machine if you'd rather use that.
- `CORS_ORIGIN` — comma-separated list of allowed origins (default `http://localhost:5173`, the Vite dev
  server).
