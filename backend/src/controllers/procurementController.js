import { dbState, getDb } from '../config/db.js'
import * as seedData from '../data/seedData.js'

// In-memory mutable fallback, only used when SQLite isn't available, so
// approve/reject still works during a demo without a database.
const memoryStore = {
  procurementRecommendations: seedData.procurementRecommendations.map((rec) => ({ ...rec }))
}

// GET /api/procurement/recommendations
export async function getProcurementRecommendations(req, res, next) {
  try {
    if (!dbState.connected) return res.json(memoryStore.procurementRecommendations)
    const db = getDb()
    const recs = db.prepare('SELECT * FROM procurement_recommendations').all()
    res.json(recs)
  } catch (err) {
    next(err)
  }
}

// POST /api/procurement/recommendations/:id/approve
export async function approveRecommendation(req, res, next) {
  return setStatus(req, res, next, 'approved')
}

// POST /api/procurement/recommendations/:id/reject
export async function rejectRecommendation(req, res, next) {
  return setStatus(req, res, next, 'rejected')
}

async function setStatus(req, res, next, status) {
  try {
    const { id } = req.params

    if (!dbState.connected) {
      const rec = memoryStore.procurementRecommendations.find((r) => r.id === id)
      if (!rec) return res.status(404).json({ message: `Recommendation "${id}" not found` })
      rec.status = status
      return res.json({ id, status })
    }

    const db = getDb()
    const result = db.prepare('UPDATE procurement_recommendations SET status = ? WHERE id = ?').run(status, id)
    if (result.changes === 0) return res.status(404).json({ message: `Recommendation "${id}" not found` })
    res.json({ id, status })
  } catch (err) {
    next(err)
  }
}
