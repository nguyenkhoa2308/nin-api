const express = require('express')
const router = express.Router()

const { getCart, addToCart } = require('~/controllers/cart.controller')

// const { verifyToken } = require('../middleware/authJwt')

router.post('/add', addToCart)
router.get('/user', getCart)
// router.delete('/delete/:cartItemId', verifyToken, Cart.deleteFromCart)
// router.post('/updateQuantity/:cartItemId/:quantity', verifyToken, Cart.updateQuantityOfCartItem)
// router.post('/cartItems', verifyToken, Cart.getCartByBookIds)

module.exports = router
