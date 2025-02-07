const express = require('express')
const router = express.Router()
import { auth } from '~/middlewares/auth'
import { getCart, addToCart, deleteCartItems, updateQuantityOfCartItem } from '~/controllers/cart.controller'

// const { verifyToken } = require('../middleware/authJwt')

router.post('/add', auth, addToCart)
router.get('/user', auth, getCart)
router.delete('/delete/:cartItemId', auth, deleteCartItems)
router.put('/updateQuantity', auth, updateQuantityOfCartItem)
// router.post('/cartItems', verifyToken, Cart.getCartByBookIds)

module.exports = router
