const express = require('express')
const router = express.Router()
import { auth, adminMiddleware } from '~/middlewares/auth'
import {
    createUser,
    login,
    getUser,
    getAccount,
    getUserById,
    updateUser,
    updateRole,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyPassword,
    deleteAccount,
} from '~/controllers/user.controller'

// const { getCart, addToCart } = require('~/controllers/user.controller')

// const { verifyToken } = require('../middleware/authJwt')

router.post('/register', createUser)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify', auth, verifyPassword)

router.get('/', getUser)
router.get('/getUserById/:id', getUserById)
router.get('/account', auth, getAccount)

router.put('/change-password', auth, changePassword)
router.put('/update', auth, updateUser)
router.put('/updateRole/:id', auth, adminMiddleware, updateRole)
router.delete('/:id', auth, adminMiddleware, deleteAccount)

module.exports = router
