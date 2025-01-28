const mongoose = require('mongoose')
const CartItem = require('~/models/cartItem.model')
const Cart = require('~/models/cart.model')
// const User = require('~/models/user.model')
const Product = require('~/models/product.model')

const addToCart = async (req, res) => {
    try {
        // if(req.user.userId)
        const userId = req.user.userId
        const { productId, quantity = 1 } = req.body

        // const user = await User.findById(userId)
        const product = await Product.findOne({ _id: productId })
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
        }

        let cart = await Cart.findOne({ user: userId })
        if (!cart) {
            cart = new Cart({ user: userId, items: [], totalPriceOriginal: 0, totalPriceFinal: 0 })
        }

        // let cart = new Cart({ items: [], totalPriceOriginal: 0, totalPriceFinal: 0 })

        let existingItem = null

        for (const item of cart.items) {
            const cartItem = await CartItem.findById(item._id).populate('product')
            if (cartItem && cartItem.book._id.equals(productId)) {
                existingItem = cartItem
                break
            }
        }

        if (existingItem) {
            if (existingItem.quantity + quantity > product.quantity) {
                existingItem.quantity = product.quantity // Gán số lượng của existingItem bằng số lượng sách có sẵn trong book
            } else {
                existingItem.quantity += quantity
            }
            await existingItem.save()
        } else {
            const newCartItem = new CartItem({ product: productId, quantity })
            await newCartItem.save()
            cart.items.push(newCartItem)
        }

        cart.totalPriceFinal += quantity * product.priceFinal
        cart.totalPriceOriginal += quantity * product.priceOriginal

        await cart.save()

        res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng thành công' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getCart = async (req, res) => {
    try {
        if (req.user.userId) {
            const cart = await Cart.findOne({ user: req.user.userId }).populate({
                path: 'items',
                populate: {
                    path: 'product',
                },
            })
            if (!cart) {
                return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho người dùng này' })
            }
            return res.status(200).json({ cart })
        } else {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    addToCart,
    getCart,
}
