const express = require('express')
const router = express.Router()
import { auth, adminMiddleware } from '~/middlewares/auth'
import { getStats } from '~/controllers/admin.controller'

router.get('/stats', auth, adminMiddleware, getStats)

module.exports = router
