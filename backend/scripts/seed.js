// Populates the local SQLite database with the demo dataset
// (src/data/seedData.js) plus computed corridor/route risk scores
// (src/services/riskScoringService.js).
// Usage: npm run seed
import 'dotenv/config'
import { connectDB, getDb } from '../src/config/db.js'
import * as seedData from '../src/data/seedData.js'
import { computeCorridorRisk, computeRouteRisk } from '../src/services/riskScoringService.js'

async function seed() {
  await connectDB()
  const db = getDb()

  console.log('Clearing existing tables ...')
  const tables = [
    'corridors', 'risk_trend', 'live_events', 'scenarios', 'scenario_impacts',
    'reserve_sites', 'drawdown_schedule', 'digital_twin_nodes', 'digital_twin_links',
    'procurement_recommendations', 'kpis', 'routes'
  ]
  db.exec('BEGIN')
  try {
    for (const table of tables) db.prepare(`DELETE FROM ${table}`).run()
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }

  console.log('Computing corridor + route risk scores from datasets ...')
  const corridorRisk = await computeCorridorRisk()
  const routeRisk = await computeRouteRisk()
  const riskById = Object.fromEntries(corridorRisk.map((c) => [c.id, c]))

  console.log('Inserting seed data ...')
  db.exec('BEGIN')
  try {
    const insertCorridor = db.prepare(
      'INSERT INTO corridors (id, name, volumeShare, risk, trend) VALUES (@id, @name, @volumeShare, @risk, @trend)'
    )
    for (const c of seedData.corridors) {
      const computed = riskById[c.id]
      insertCorridor.run({
        ...c,
        risk: computed ? computed.risk : c.risk,
        trend: computed ? computed.trend : c.trend
      })
    }

    const insertTrend = db.prepare(
      'INSERT INTO risk_trend (ord, day, hormuz, redsea, suez) VALUES (@ord, @day, @hormuz, @redsea, @suez)'
    )
    seedData.riskTrend.forEach((row, i) => insertTrend.run({ ...row, ord: i }))

    const insertEvent = db.prepare(
      'INSERT INTO live_events (eventId, time, severity, source, text) VALUES (@eventId, @time, @severity, @source, @text)'
    )
    for (const e of seedData.liveEvents) insertEvent.run(e)

    const insertScenario = db.prepare(
      'INSERT INTO scenarios (id, name, description, likelihood, severity) VALUES (@id, @name, @description, @likelihood, @severity)'
    )
    for (const s of seedData.scenarios) insertScenario.run(s)

    const insertImpact = db.prepare(
      'INSERT INTO scenario_impacts (scenarioId, priceImpact, gdpImpact, refiningImpact, daysToStockout, cascade) VALUES (@scenarioId, @priceImpact, @gdpImpact, @refiningImpact, @daysToStockout, @cascade)'
    )
    for (const impact of Object.values(seedData.scenarioImpact)) {
      insertImpact.run({ ...impact, cascade: JSON.stringify(impact.cascade) })
    }

    const insertReserve = db.prepare(
      'INSERT INTO reserve_sites (id, name, capacity, level) VALUES (@id, @name, @capacity, @level)'
    )
    for (const r of seedData.reserveSites) insertReserve.run(r)

    const insertDrawdown = db.prepare(
      'INSERT INTO drawdown_schedule (ord, week, projected, optimized) VALUES (@ord, @week, @projected, @optimized)'
    )
    seedData.drawdownSchedule.forEach((row, i) => insertDrawdown.run({ ...row, ord: i }))

    const insertNode = db.prepare(
      'INSERT INTO digital_twin_nodes (id, label, type, x, y, status) VALUES (@id, @label, @type, @x, @y, @status)'
    )
    for (const n of seedData.digitalTwinNodes) insertNode.run(n)

    const insertLink = db.prepare('INSERT INTO digital_twin_links (fromNode, toNode) VALUES (@fromNode, @toNode)')
    for (const l of seedData.digitalTwinLinks) insertLink.run({ fromNode: l.from, toNode: l.to })

    const insertRec = db.prepare(
      'INSERT INTO procurement_recommendations (id, source, route, volume, etaDays, costDelta, riskScore, status) VALUES (@id, @source, @route, @volume, @etaDays, @costDelta, @riskScore, @status)'
    )
    for (const r of seedData.procurementRecommendations) insertRec.run(r)

    db.prepare(
      'INSERT INTO kpis (singletonKey, globalRiskIndex, daysOfCover, activeAlerts, pendingRecommendations, affectedVolumeShare) VALUES (@singletonKey, @globalRiskIndex, @daysOfCover, @activeAlerts, @pendingRecommendations, @affectedVolumeShare)'
    ).run({ singletonKey: 'kpis', ...seedData.kpis })

    const insertRoute = db.prepare(
      `INSERT INTO routes (id, originPort, originCountry, destPort, destCountry, distanceNm, transitDays, tradeLane, canalRoute, chokepoints, riskScore, riskLabel)
       VALUES (@id, @originPort, @originCountry, @destPort, @destCountry, @distanceNm, @transitDays, @tradeLane, @canalRoute, @chokepoints, @riskScore, @riskLabel)`
    )
    for (const r of routeRisk) insertRoute.run({ ...r, chokepoints: JSON.stringify(r.chokepoints) })

    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }

  console.log(`Seed complete: ${seedData.corridors.length} corridors, ${routeRisk.length} routes scored.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
