import { dbState, getDb } from '../config/db.js'
import * as seedData from '../data/seedData.js'
import { computeCorridorRisk } from '../services/riskScoringService.js'
import { fetchLiveGeopoliticalEvents } from '../services/newsService.js'

// GET /api/dashboard/kpis
// globalRiskIndex and affectedVolumeShare are derived live from the current
// corridor risk scores (so they move with NEWS_API_KEY activity, same as
// /api/risk/corridors). daysOfCover and pendingRecommendations come from the
// reserve/procurement datasets, which aren't news-driven.
export async function getKpis(req, res, next) {
  try {
    const corridors = await computeCorridorRisk()
    const meta = Object.fromEntries(seedData.corridors.map((c) => [c.id, c]))

    const totalVolumeShare = seedData.corridors.reduce((sum, c) => sum + c.volumeShare, 0)
    const globalRiskIndex = Math.round(
      corridors.reduce((sum, c) => sum + c.risk * (meta[c.id]?.volumeShare ?? 0), 0) / totalVolumeShare
    )
    const affectedVolumeShare = Math.round(
      corridors.filter((c) => c.risk >= 50).reduce((sum, c) => sum + (meta[c.id]?.volumeShare ?? 0), 0)
    )

    const liveEvents = await fetchLiveGeopoliticalEvents()
    const eventsForAlerts = liveEvents || seedData.liveEvents
    const activeAlerts = eventsForAlerts.filter((e) => e.severity === 'critical' || e.severity === 'high').length

    let daysOfCover = seedData.kpis.daysOfCover
    let pendingRecommendations = seedData.kpis.pendingRecommendations

    if (dbState.connected) {
      const db = getDb()
      const reserves = db.prepare('SELECT capacity, level FROM reserve_sites').all()
      const drawdown = db.prepare('SELECT projected FROM drawdown_schedule ORDER BY ord ASC LIMIT 1').get()
      if (reserves.length > 0 && drawdown?.projected) {
        const currentVolume = reserves.reduce((sum, r) => sum + r.capacity * (r.level / 100), 0)
        daysOfCover = Math.round((currentVolume / drawdown.projected) * 10) / 10
      }
      const pending = db.prepare("SELECT COUNT(*) as n FROM procurement_recommendations WHERE status = 'pending'").get()
      pendingRecommendations = pending.n
    }

    res.json({ globalRiskIndex, daysOfCover, activeAlerts, pendingRecommendations, affectedVolumeShare })
  } catch (err) {
    console.warn('[dashboard] Live KPI computation failed, falling back to stored data:', err.message)
    if (!dbState.connected) return res.json(seedData.kpis)
    try {
      const db = getDb()
      const kpi = db.prepare('SELECT * FROM kpis WHERE singletonKey = ?').get('kpis')
      if (!kpi) return res.json(seedData.kpis)
      const { singletonKey, ...rest } = kpi
      res.json(rest)
    } catch (fallbackErr) {
      next(fallbackErr)
    }
  }
}
