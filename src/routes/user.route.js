const express = require('express')
const router = express.Router()
import { auth } from '~/middlewares/auth'
import { createUser, login, getUser, getAccount } from '~/controllers/user.controller'

// const { getCart, addToCart } = require('~/controllers/user.controller')

// const { verifyToken } = require('../middleware/authJwt')

router.post('/register', createUser)
router.post('/login', login)

router.get('/getUser', getUser)
router.get('/account', auth, getAccount)

module.exports = router
