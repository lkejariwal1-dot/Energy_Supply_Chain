import { Router } from 'express'
import { getCorridors, getRiskTrend, getLiveEvents, getRoutes, getRouteById, getPorts } from '../controllers/riskController.js'

const router = Router()

router.get('/corridors', getCorridors)
router.get('/trend', getRiskTrend)
router.get('/events', getLiveEvents)
router.get('/routes', getRoutes)
router.get('/routes/:id', getRouteById)
router.get('/ports', getPorts)

export default router
