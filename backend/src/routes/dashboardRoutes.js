import { Router } from 'express'
import { getKpis } from '../controllers/dashboardController.js'

const router = Router()

router.get('/kpis', getKpis)

export default router
