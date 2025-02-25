const express = require('express')
const router = express.Router()
import { auth, adminMiddleware } from '~/middlewares/auth'

import { getAllOrder, createOrder, getOrderByUserId, updateStatusOrder } from '~/controllers/order.controller'

// const { verifyToken } = require('../middleware/authJwt')

router.get('/', auth, adminMiddleware, getAllOrder)
router.put('/:id/status', auth, adminMiddleware, updateStatusOrder)

router.get('/user', auth, getOrderByUserId)
router.post('/add', auth, createOrder)
// router.delete('/delete/:cartItemId', auth, deleteCartItems)
// router.put('/updateQuantity', auth, updateQuantityOfCartItem)
// router.post('/cartItems', verifyToken, Cart.getCartByBookIds)

module.exports = router
