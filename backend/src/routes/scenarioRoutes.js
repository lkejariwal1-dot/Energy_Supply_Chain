import { Router } from 'express'
import { getScenarios, getScenarioImpact } from '../controllers/scenarioController.js'

const router = Router()

router.get('/', getScenarios)
router.get('/:id/impact', getScenarioImpact)

export default router
