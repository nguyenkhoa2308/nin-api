/* eslint-disable indent */
const mongoose = require('mongoose')
const CartItem = require('~/models/cartItem.model')
const Cart = require('~/models/cart.model')
// const User = require('~/models/user.model')
const Product = require('~/models/product.model')
const { populate } = require('dotenv')

const addToCart = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Người dùng cần đăng nhập', EC: 3 })
        }

        const { productId, quantity = 1, variantId } = req.body
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại', EC: 2 })
        }

        const selectedVariant = product.variant.find((v) => v._id.toString() === variantId)
        if (!selectedVariant) {
            return res.status(400).json({ message: 'Màu sắc không hợp lệ!', EC: 4 })
        }

        // Lấy giỏ hàng của người dùng, nếu chưa có thì tạo mới
        let cart = await Cart.findOne({ user: req.user.id }).populate('items')

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [], totalPriceOriginal: 0, totalPriceFinal: 0 })
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        let existingItem = cart.items.find((item) => item.product.equals(productId) && item.variantId.equals(variantId))

        if (existingItem) {
            // Nếu tổng số lượng vượt quá tồn kho, giới hạn lại

            if (existingItem.quantity === product.stock) {
                return res.status(400).json({
                    message: 'Số lượng đã đạt tới tối đa. Không thể thêm',
                    EC: 4,
                })
            }

            if (existingItem.quantity + quantity > product.stock) {
                return res.status(400).json({
                    message: `Chỉ có thể thêm tối đa ${product.stock - existingItem.quantity} sản phẩm nữa.`,
                    EC: 4,
                })
            }

            existingItem.quantity += quantity
            await existingItem.save()
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({
                    message: `Chỉ có thể thêm tối đa ${product.stock} sản phẩm.`,
                    EC: 4,
                })
            }

            const newCartItem = new CartItem({ product: productId, variantId, quantity })
            await newCartItem.save()
            cart.items.push(newCartItem)
        }

        cart.totalPriceFinal += quantity * product.priceFinal
        cart.totalPriceOriginal += quantity * product.priceOriginal

        await cart.save()

        res.status(200).json({
            message: 'Sản phẩm đã được thêm vào giỏ hàng thành công',
            cart,
            EC: 0,
        })
    } catch (error) {
        res.status(500).json({ message: error.message, EC: 1 })
    }
}

const updateQuantityOfCartItem = async (req, res) => {
    try {
        // Kiểm tra nếu người dùng chưa đăng nhập
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' })
        }

        const { quantity, cartItemId } = req.body

        // Kiểm tra tính hợp lệ của quantity
        if (quantity <= 0) {
            return res.status(400).json({ message: 'Số lượng sản phẩm phải lớn hơn 0' })
        }

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: req.user.id }).populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'priceOriginal priceFinal',
            },
        })

        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' })
        }

        // Tìm mục sản phẩm trong giỏ hàng
        const cartItem = cart.items.find((item) => item._id.equals(cartItemId))
        if (!cartItem) {
            return res.status(404).json({ message: `Không tìm thấy mục hàng với ID ${cartItemId}` })
        }

        // Cập nhật số lượng sản phẩm trong cartItem
        cartItem.quantity = quantity
        await cartItem.save()

        // Cập nhật lại giỏ hàng
        let totalPriceOriginal = 0
        let totalPriceFinal = 0

        // Tính tổng giá trị giỏ hàng sau khi cập nhật số lượng
        for (const item of cart.items) {
            totalPriceOriginal += item.quantity * item.product.priceOriginal
            totalPriceFinal += item.quantity * item.product.priceFinal
        }

        cart.totalPriceOriginal = totalPriceOriginal
        cart.totalPriceFinal = totalPriceFinal

        await cart.save()

        res.status(200).json({ message: 'Số lượng sản phẩm đã được cập nhật thành công', EC: 0 })
    } catch (error) {
        // console.error(error)
        res.status(500).json({ message: 'Lỗi máy chủ' })
    }
}

const deleteCartItems = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' })
        }

        const { cartItemId } = req.params

        const cart = await Cart.findOne({ user: req.user.id }).populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'priceOriginal priceFinal',
            },
        })

        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' })
        }

        // Tìm index của cartItem trong giỏ hàng
        const index = cart.items.findIndex((item) => item._id.equals(cartItemId))
        if (index === -1) {
            return res.status(404).json({ message: 'Không có sản phẩm này trong giỏ hàng' })
        }

        const item = cart.items[index]

        // Cập nhật tổng giá tiền
        if (item.product) {
            cart.totalPriceOriginal -= item.product.priceOriginal * item.quantity
            cart.totalPriceFinal -= item.product.priceFinal * item.quantity
        }

        // Xóa item khỏi giỏ hàng
        cart.items.splice(index, 1)

        // Xóa cartItem khỏi database
        await CartItem.findByIdAndDelete(cartItemId)

        // Lưu giỏ hàng
        await cart.save()

        res.status(200).json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công', EC: 0 })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ' })
    }
}

const getCart = async (req, res) => {
    try {
        if (req.user.id) {
            const cart = await Cart.findOne({ user: req.user.id }).populate({
                path: 'items',
                populate: {
                    path: 'product',
                },
            })
            if (!cart) {
                const newCart = new Cart({
                    user: req.user.id,
                    items: [], // Giỏ hàng trống ban đầu
                    totalPriceFinal: 0,
                    totalPriceOriginal: 0,
                })
                await newCart.save()
                return res.status(201).json({ cart: newCart })
                // return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho người dùng này', EC: 2 })
            }

            const cartItems = cart.items.map((item) => {
                const product = item.product
                const selectedVariant = product.variant.find((v) => v._id.toString() === item.variantId.toString())

                return {
                    _id: item._id,
                    product: {
                        _id: product._id,
                        name: product.name,
                        stock: product.stock,
                        slug: product.slug,
                        image: selectedVariant?.images[0] || product.image, // Ảnh của variant hoặc ảnh chính của product
                        priceOriginal: product.priceOriginal,
                        priceFinal: product.priceFinal || product.priceOriginal,
                    },
                    variant: selectedVariant
                        ? {
                              _id: selectedVariant._id,
                              name: selectedVariant.name, // Chỉ lấy name của variant
                          }
                        : null,
                    quantity: item.quantity,
                }
            })

            return res.status(200).json({ cart: { ...cart.toObject(), items: cartItems } })
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
    deleteCartItems,
    updateQuantityOfCartItem,
}
