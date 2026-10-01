import 'dotenv/config'
import { createApp } from './src/app.js'
import { connectDB, dbState } from './src/config/db.js'

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()

  const app = createApp()

  app.listen(PORT, () => {
    console.log(`[server] Energy Resilience API listening on http://localhost:${PORT}`)
    console.log(`[server] Data source: ${dbState.connected ? 'SQLite' : 'in-memory (SQLite file could not be opened)'}`)
    console.log(`[server] Health check: http://localhost:${PORT}/api/health`)
  })
}

start().catch((err) => {
  console.error('[server] Failed to start:', err)
  process.exit(1)
})
