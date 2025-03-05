const express = require('express')
const router = express.Router()
import { auth, adminMiddleware } from '~/middlewares/auth'

import {
    getAllOrder,
    createOrder,
    getOrderByUserId,
    updateStatusOrder,
    deleteOrderById,
} from '~/controllers/order.controller'

// const { verifyToken } = require('../middleware/authJwt')

router.get('/', auth, adminMiddleware, getAllOrder)
router.put('/:id/status', auth, updateStatusOrder)
router.delete('/delete/:id', auth, adminMiddleware, deleteOrderById)

router.get('/user', auth, getOrderByUserId)
router.post('/add', auth, createOrder)
// router.put('/updateQuantity', auth, updateQuantityOfCartItem)
// router.post('/cartItems', verifyToken, Cart.getCartByBookIds)

module.exports = router
