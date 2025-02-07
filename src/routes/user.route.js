const express = require('express')
const router = express.Router()
import { auth } from '~/middlewares/auth'
import { createUser, login, getUser, getAccount, getUserById, updateUser } from '~/controllers/user.controller'

// const { getCart, addToCart } = require('~/controllers/user.controller')

// const { verifyToken } = require('../middleware/authJwt')

router.post('/register', createUser)
router.post('/login', login)

router.get('/getUser', getUser)
router.get('/getUserById/:id', getUserById)
router.get('/account', auth, getAccount)

router.put('/update', auth, updateUser)

module.exports = router
