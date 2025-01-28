const express = require('express')
const router = express.Router()
import { createUser, login, getUser } from '~/controllers/user.controller'

// const { getCart, addToCart } = require('~/controllers/user.controller')

// const { verifyToken } = require('../middleware/authJwt')

router.post('/register', createUser)
router.post('/login', login)

router.get('/getUser', getUser)

module.exports = router
