import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { initSchema } from '../db/schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Tracks whether we're actually talking to the local SQLite file. When
// false, the controllers fall back to serving straight from the in-memory
// seed data (see src/data/seedData.js) so the API always responds instead
// of crashing if the file can't be opened for some reason (e.g. bad
// permissions, missing native binary, corrupt file).
export const dbState = {
  connected: false
}

let dbInstance = null

// Path to the SQLite file. Defaults to backend/data/energy.db — a local
// file next to the project, no server/service to install or run (unlike
// MongoDB). Override with SQLITE_PATH in .env to point at a different
// location on your machine.
function resolveDbPath() {
  const configured = process.env.SQLITE_PATH
  if (configured) return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured)
  return path.join(__dirname, '..', '..', 'data', 'energy.db')
}

export async function connectDB() {
  const dbPath = resolveDbPath()

  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    dbInstance = new DatabaseSync(dbPath)
    dbInstance.exec('PRAGMA journal_mode = WAL')
    dbInstance.exec('PRAGMA foreign_keys = ON')
    initSchema(dbInstance)
    dbState.connected = true
    console.log(`[db] Connected to SQLite at ${dbPath}`)
  } catch (err) {
    console.warn(`[db] Could not open SQLite database (${err.message}). Falling back to in-memory data mode.`)
    dbState.connected = false
    dbInstance = null
  }
}

// Returns the raw node:sqlite DatabaseSync connection. Only call after checking
// dbState.connected (matching the previous Mongo-backed pattern).
export function getDb() {
  if (!dbInstance) throw new Error('SQLite database is not connected')
  return dbInstance
}
