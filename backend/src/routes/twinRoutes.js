import { Router } from 'express'
import { getTwinState } from '../controllers/twinController.js'

const router = Router()

router.get('/state', getTwinState)

export default router
