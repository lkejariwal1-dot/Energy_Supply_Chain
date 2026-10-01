import { dbState, getDb } from '../config/db.js'
import * as seedData from '../data/seedData.js'

// GET /api/reserves/sites
export async function getReserveSites(req, res, next) {
  try {
    if (!dbState.connected) return res.json(seedData.reserveSites)
    const db = getDb()
    const sites = db.prepare('SELECT * FROM reserve_sites').all()
    res.json(sites)
  } catch (err) {
    next(err)
  }
}

// GET /api/reserves/drawdown
export async function getDrawdownSchedule(req, res, next) {
  try {
    if (!dbState.connected) return res.json(seedData.drawdownSchedule)
    const db = getDb()
    const schedule = db.prepare('SELECT week, projected, optimized FROM drawdown_schedule ORDER BY ord ASC').all()
    res.json(schedule)
  } catch (err) {
    next(err)
  }
}
