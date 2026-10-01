import { Router } from 'express'
import { getReserveSites, getDrawdownSchedule } from '../controllers/reserveController.js'

const router = Router()

router.get('/sites', getReserveSites)
router.get('/drawdown', getDrawdownSchedule)

export default router
