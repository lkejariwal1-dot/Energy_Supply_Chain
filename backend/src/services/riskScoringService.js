// Geopolitical Risk Intelligence Agent — route/corridor risk scoring.
//
// This is a transparent, weighted rule-based scorer, not a trained ML
// model: the historical events dataset only has ~124 real (non-blank) rows
// spanning 1648-2026 with no numeric risk-score labels attached, which
// isn't enough to fit a supervised model against. Instead we combine:
//
//   1. A base criticality per chokepoint (is it a structural bottleneck at
//      all, e.g. Strait of Hormuz vs. open Cape of Good Hope water)
//   2. Historical events near that chokepoint, weighted by how recent the
//      event's era is and how severe its language is (reusing the same
//      keyword classifier the live news feed uses, for consistency)
//   3. Live news, when NEWS_API_KEY is configured, using the same keyword
//      classifier and matched to a chokepoint by keyword
//
// Every shipping route is then scored by which chokepoint(s) it transits
// (inferred from Canal_Route plus origin/destination ports), taking the
// worst of the chokepoints it passes through.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv } from '../utils/csv.js'
import { classifySeverity, fetchLiveGeopoliticalEvents } from './newsService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATASET_DIR = path.join(__dirname, '..', '..', 'dataset')

// -- Corridor definitions -----------------------------------------------

// Keywords used to match free-text (event descriptions, news headlines,
// port/country names) to one of the five tracked corridors.
const CORRIDOR_KEYWORDS = {
  hormuz: ['hormuz', 'persian gulf', 'iran'],
  redsea: ['red sea', 'houthi', 'bab-el-mandeb', 'bab el mandeb', 'yemen', 'gulf of aden'],
  suez: ['suez'],
  malacca: ['malacca', 'south china sea', 'taiwan strait', 'singapore strait'],
  capegood: ['cape of good hope']
}

// Structural criticality before any events are factored in — reflects
// whether the corridor is a hard chokepoint at all (Hormuz has no
// alternative route; Cape of Good Hope is itself an alternative route).
const BASE_CRITICALITY = {
  hormuz: 55,
  redsea: 35,
  suez: 30,
  malacca: 25,
  capegood: 12
}

// Ports/countries that sit inside or depend on transiting a given
// chokepoint, used for route -> corridor inference below.
const PERSIAN_GULF_PORTS = ['jebel ali', 'dammam', 'dubai', 'abu dhabi', 'doha', 'kuwait']
const MALACCA_ADJACENT_PORTS = ['singapore', 'port klang', 'tanjung pelepas', 'jakarta', 'colombo']
const CAPE_ROUTE_PORTS = ['durban', 'cape town', 'mombasa']

// Historical era -> recency weight. "The New Disorder" (2011-2026, per the
// dataset's own Era tagging) is weighted at full strength; everything
// older matters progressively less to *current* corridor risk.
const ERA_WEIGHTS = {
  'The New Disorder': 1.0,
  'War on Terror': 0.35,
  'Unipolar Moment': 0.2,
  'The Cold War': 0.1,
  'World Wars': 0.05,
  'The Age of Empires': 0.02
}

const SEVERITY_SCORE = { critical: 30, high: 18, medium: 8, low: 3 }

const PANAMA_ROUTE_RISK = 22 // not one of the 5 tracked corridors, but real (drought/congestion)

function riskLabel(score) {
  if (score >= 70) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

function matchCorridors(text) {
  const lower = text.toLowerCase()
  return Object.entries(CORRIDOR_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
    .map(([id]) => id)
}

function readCsv(filename) {
  if (csvCache.has(filename)) return csvCache.get(filename)
  const filePath = path.join(DATASET_DIR, filename)
  const text = fs.readFileSync(filePath, 'utf-8')
  const rows = parseCsv(text)
  csvCache.set(filename, rows)
  return rows
}

const csvCache = new Map()

// -- Historical + live event scoring -------------------------------------

function scoreHistoricalEvents() {
  const rows = readCsv('geopolitical_risk_events_timeline.csv').filter((r) => r.Date && r.Event)
  const contributions = { hormuz: 0, redsea: 0, suez: 0, malacca: 0, capegood: 0 }
  const matchedEvents = { hormuz: [], redsea: [], suez: [], malacca: [], capegood: [] }

  for (const row of rows) {
    const text = `${row.Event} ${row.Description || ''}`
    const corridors = matchCorridors(text)
    if (corridors.length === 0) continue

    const eraWeight = ERA_WEIGHTS[row.Era] ?? 0.05
    const severity = classifySeverity(text)
    const contribution = eraWeight * SEVERITY_SCORE[severity]

    for (const corridor of corridors) {
      contributions[corridor] += contribution
      matchedEvents[corridor].push({ date: row.Date, event: row.Event, severity, era: row.Era })
    }
  }

  return { contributions, matchedEvents }
}

async function scoreLiveEvents() {
  const contributions = { hormuz: 0, redsea: 0, suez: 0, malacca: 0, capegood: 0 }
  const events = await fetchLiveGeopoliticalEvents()
  if (!events) return contributions

  for (const event of events) {
    const corridors = matchCorridors(event.text)
    const contribution = 1.2 * (SEVERITY_SCORE[event.severity] ?? SEVERITY_SCORE.medium)
    for (const corridor of corridors) {
      contributions[corridor] += contribution
    }
  }
  return contributions
}

// -- Route -> chokepoint inference ---------------------------------------

function inferChokepoints(route) {
  const canal = (route.Canal_Route || '').toLowerCase()
  const origin = (route.Origin_Port || '').toLowerCase()
  const dest = (route.Destination_Port || '').toLowerCase()
  const lane = (route.Trade_Lane || '').toLowerCase()

  if (canal.includes('suez canal')) return ['suez', 'redsea']
  if (canal.includes('suez approach')) return ['redsea']
  if (canal.includes('panama canal')) return ['panama']

  if (PERSIAN_GULF_PORTS.some((p) => origin.includes(p) || dest.includes(p))) return ['hormuz']

  if (MALACCA_ADJACENT_PORTS.some((p) => origin.includes(p) || dest.includes(p)) && lane.includes('asia')) {
    return ['malacca']
  }

  if (CAPE_ROUTE_PORTS.some((p) => origin.includes(p) || dest.includes(p))) return ['capegood']

  return []
}

// -- Public API ------------------------------------------------------------

/**
 * Computes 0-100 risk scores for the five tracked corridors, blending
 * structural criticality, era-weighted historical events, and (if
 * configured) live news. Returns objects ready to write into the
 * `corridors` table.
 */
export async function computeCorridorRisk() {
  const { contributions: historical, matchedEvents } = scoreHistoricalEvents()
  const live = await scoreLiveEvents()

  return Object.keys(BASE_CRITICALITY).map((id) => {
    const base = BASE_CRITICALITY[id]
    const raw = base + historical[id] + live[id]
    const risk = Math.max(0, Math.min(100, Math.round(raw)))
    const trend = risk > base + 8 ? 'up' : risk < base - 5 ? 'down' : 'flat'
    const topEvents = matchedEvents[id]
      .slice()
      .sort((a, b) => (SEVERITY_SCORE[b.severity] ?? 0) - (SEVERITY_SCORE[a.severity] ?? 0))
      .slice(0, 3)
      .map((e) => `${e.event} (${e.date})`)
    return {
      id,
      risk,
      trend,
      label: riskLabel(risk),
      contributingEvents: matchedEvents[id].length,
      liveContribution: Math.round(live[id]),
      topEvents
    }
  })
}

/**
 * Scores every route in ship_routing.csv against the current corridor
 * risk scores. Returns rows ready to write into the `routes` table.
 */
export async function computeRouteRisk() {
  const corridorScores = await computeCorridorRisk()
  const scoreById = Object.fromEntries(corridorScores.map((c) => [c.id, c.risk]))
  const routes = readCsv('ship_routing.csv')

  return routes.map((route) => {
    const chokepoints = inferChokepoints(route)
    let score

    if (chokepoints.includes('panama')) {
      score = PANAMA_ROUTE_RISK
    } else if (chokepoints.length > 0) {
      score = Math.max(...chokepoints.map((cp) => scoreById[cp] ?? 0))
    } else {
      // Open-ocean routes with no major chokepoint: small baseline that
      // scales slightly with transit length (more days at sea = more
      // exposure to weather/piracy, but nowhere near chokepoint-level risk).
      const days = Number(route.Typical_Transit_Days) || 10
      score = Math.min(18, 6 + days * 0.3)
    }

    score = Math.round(score)

    return {
      id: route.Route_ID,
      originPort: route.Origin_Port,
      originCountry: route.Origin_Country,
      destPort: route.Destination_Port,
      destCountry: route.Destination_Country,
      distanceNm: Number(route.Distance_NM) || 0,
      transitDays: Number(route.Typical_Transit_Days) || 0,
      tradeLane: route.Trade_Lane,
      canalRoute: route.Canal_Route,
      chokepoints,
      riskScore: score,
      riskLabel: riskLabel(score)
    }
  })
}

/**
 * Distinct list of origin/destination ports (with country) for populating
 * a "pick your route" dropdown in the frontend.
 */
export function getRoutePorts() {
  const routes = readCsv('ship_routing.csv')
  const seen = new Map()
  for (const r of routes) {
    for (const [port, country] of [
      [r.Origin_Port, r.Origin_Country],
      [r.Destination_Port, r.Destination_Country]
    ]) {
      if (port && !seen.has(port)) seen.set(port, country)
    }
  }
  return [...seen.entries()]
    .map(([port, country]) => ({ port, country }))
    .sort((a, b) => a.port.localeCompare(b.port))
}
