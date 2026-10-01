import { dbState, getDb } from '../config/db.js'
import * as seedData from '../data/seedData.js'

// GET /api/twin/state
export async function getTwinState(req, res, next) {
  try {
    if (!dbState.connected) {
      return res.json({ nodes: seedData.digitalTwinNodes, links: seedData.digitalTwinLinks })
    }
    const db = getDb()
    const nodes = db.prepare('SELECT * FROM digital_twin_nodes').all()
    const links = db.prepare('SELECT fromNode as "from", toNode as "to" FROM digital_twin_links').all()
    res.json({ nodes, links })
  } catch (err) {
    next(err)
  }
}
