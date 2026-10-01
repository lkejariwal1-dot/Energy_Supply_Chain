import { dbState, getDb } from '../config/db.js'
import * as seedData from '../data/seedData.js'
import { fetchLiveGeopoliticalEvents } from '../services/newsService.js'
import { computeCorridorRisk, computeRouteRisk, getRoutePorts } from '../services/riskScoringService.js'

// GET /api/risk/corridors
// Computed live on every request (base criticality + era-weighted historical
// events + live news, see riskScoringService.js) so it reflects new
// NEWS_API_KEY activity or dataset edits without needing a re-seed. Falls
// back to the last-seeded DB snapshot (or bundled seed data) if the live
// computation throws for any reason.
export async function getCorridors(req, res, next) {
  try {
    const computed = await computeCorridorRisk()
    const meta = Object.fromEntries(seedData.corridors.map((c) => [c.id, c]))
    const corridors = computed
      .map((c) => ({
        id: c.id,
        name: meta[c.id]?.name ?? c.id,
        volumeShare: meta[c.id]?.volumeShare ?? 0,
        risk: c.risk,
        trend: c.trend,
        contributingEvents: c.contributingEvents,
        topEvents: c.topEvents
      }))
      .sort((a, b) => b.risk - a.risk)
    res.json(corridors)
  } catch (err) {
    console.warn('[risk] Live corridor scoring failed, falling back to stored data:', err.message)
    if (!dbState.connected) return res.json(seedData.corridors)
    try {
      const db = getDb()
      res.json(db.prepare('SELECT * FROM corridors ORDER BY risk DESC').all())
    } catch (fallbackErr) {
      next(fallbackErr)
    }
  }
}

// GET /api/risk/trend
export async function getRiskTrend(req, res, next) {
  try {
    if (!dbState.connected) return res.json(seedData.riskTrend)
    const db = getDb()
    const trend = db.prepare('SELECT day, hormuz, redsea, suez FROM risk_trend ORDER BY ord ASC').all()
    res.json(trend)
  } catch (err) {
    next(err)
  }
}

// GET /api/risk/events
// Tries live news first (NewsData.io), and falls back to the stored/seed
// event timeline if the live feed is unavailable for any reason. This keeps
// the endpoint returning 200 with usable data even if NEWS_API_KEY is
// missing, the provider is down, rate-limited, or times out.
export async function getLiveEvents(req, res, next) {
  try {
    const liveEvents = await fetchLiveGeopoliticalEvents()
    if (liveEvents) return res.json(liveEvents)

    if (!dbState.connected) {
      return res.json(seedData.liveEvents.map(({ eventId, ...rest }) => ({ id: eventId, ...rest })))
    }
    const db = getDb()
    const events = db.prepare('SELECT * FROM live_events ORDER BY eventId ASC').all()
    res.json(events.map(({ eventId, ...rest }) => ({ id: eventId, ...rest })))
  } catch (err) {
    next(err)
  }
}

// GET /api/risk/routes
// Geopolitical Risk Intelligence Agent: every shipping route (ship_routing.csv)
// scored live 0-100 against the current corridor risk. Query params:
// ?corridor=hormuz, ?minRisk=50, ?origin=Singapore, ?destination=Rotterdam
export async function getRoutes(req, res, next) {
  try {
    const { corridor, minRisk, origin, destination } = req.query
    let rows = await computeRouteRisk()

    if (corridor) rows = rows.filter((r) => r.chokepoints.includes(corridor))
    if (minRisk) rows = rows.filter((r) => r.riskScore >= Number(minRisk))
    if (origin) rows = rows.filter((r) => r.originPort.toLowerCase() === origin.toLowerCase())
    if (destination) rows = rows.filter((r) => r.destPort.toLowerCase() === destination.toLowerCase())

    rows.sort((a, b) => b.riskScore - a.riskScore)
    res.json(rows)
  } catch (err) {
    console.warn('[risk] Live route scoring failed, falling back to stored data:', err.message)
    if (!dbState.connected) {
      return res.status(503).json({ message: 'Route risk scoring is temporarily unavailable.' })
    }
    try {
      const db = getDb()
      const rows = db.prepare('SELECT * FROM routes ORDER BY riskScore DESC').all()
      res.json(rows.map((r) => ({ ...r, chokepoints: JSON.parse(r.chokepoints) })))
    } catch (fallbackErr) {
      next(fallbackErr)
    }
  }
}

// GET /api/risk/routes/:id
export async function getRouteById(req, res, next) {
  try {
    const rows = await computeRouteRisk()
    const row = rows.find((r) => r.id === req.params.id)
    if (!row) return res.status(404).json({ message: `Route "${req.params.id}" not found` })
    res.json(row)
  } catch (err) {
    next(err)
  }
}

// GET /api/risk/ports
// Distinct origin/destination ports (with country) for populating a
// "pick your route" dropdown in the frontend.
export async function getPorts(req, res, next) {
  try {
    res.json(getRoutePorts())
  } catch (err) {
    next(err)
  }
}
