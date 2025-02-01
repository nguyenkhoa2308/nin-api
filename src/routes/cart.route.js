const express = require('express')
const router = express.Router()
import { auth } from '~/middlewares/auth'
import { getCart, addToCart } from '~/controllers/cart.controller'

// const { verifyToken } = require('../middleware/authJwt')

router.post('/add', auth, addToCart)
router.get('/user', auth, getCart)
// router.delete('/delete/:cartItemId', verifyToken, Cart.deleteFromCart)
// router.post('/updateQuantity/:cartItemId/:quantity', verifyToken, Cart.updateQuantityOfCartItem)
// router.post('/cartItems', verifyToken, Cart.getCartByBookIds)

module.exports = router
