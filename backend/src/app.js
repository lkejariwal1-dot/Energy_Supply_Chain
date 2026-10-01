import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import { dbState } from './config/db.js'
import riskRoutes from './routes/riskRoutes.js'
import scenarioRoutes from './routes/scenarioRoutes.js'
import reserveRoutes from './routes/reserveRoutes.js'
import twinRoutes from './routes/twinRoutes.js'
import procurementRoutes from './routes/procurementRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())

  app.use(cors({ origin: corsOrigins }))
  app.use(express.json())
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  // Health check — useful for confirming the server (and DB / news mode) is up.
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      dataSource: dbState.connected ? 'sqlite' : 'in-memory',
      newsFeed: process.env.NEWS_API_KEY ? 'newsdata.io' : 'seed-data-only',
      timestamp: new Date().toISOString()
    })
  })

  app.use('/api/risk', riskRoutes)
  app.use('/api/scenarios', scenarioRoutes)
  app.use('/api/reserves', reserveRoutes)
  app.use('/api/twin', twinRoutes)
  app.use('/api/procurement', procurementRoutes)
  app.use('/api/dashboard', dashboardRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
