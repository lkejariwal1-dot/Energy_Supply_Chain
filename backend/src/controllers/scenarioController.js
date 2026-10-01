import { dbState, getDb } from '../config/db.js'
import * as seedData from '../data/seedData.js'

// GET /api/scenarios
export async function getScenarios(req, res, next) {
  try {
    if (!dbState.connected) return res.json(seedData.scenarios)
    const db = getDb()
    const scenarios = db.prepare('SELECT * FROM scenarios').all()
    res.json(scenarios)
  } catch (err) {
    next(err)
  }
}

// GET /api/scenarios/:id/impact
export async function getScenarioImpact(req, res, next) {
  try {
    const { id } = req.params

    if (!dbState.connected) {
      const impact = seedData.scenarioImpact[id]
      if (!impact) return res.status(404).json({ message: `No impact data for scenario "${id}"` })
      return res.json(impact)
    }

    const db = getDb()
    const impact = db.prepare('SELECT * FROM scenario_impacts WHERE scenarioId = ?').get(id)
    if (!impact) return res.status(404).json({ message: `No impact data for scenario "${id}"` })
    res.json({ ...impact, cascade: JSON.parse(impact.cascade) })
  } catch (err) {
    next(err)
  }
}
