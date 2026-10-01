import { Router } from 'express'
import {
  getProcurementRecommendations,
  approveRecommendation,
  rejectRecommendation
} from '../controllers/procurementController.js'

const router = Router()

router.get('/recommendations', getProcurementRecommendations)
router.post('/recommendations/:id/approve', approveRecommendation)
router.post('/recommendations/:id/reject', rejectRecommendation)

export default router
