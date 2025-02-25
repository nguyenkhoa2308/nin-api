/* eslint-disable indent */
import httpRequest from '~/utils/httpRequest'

import Order from '~/models/order.model'
import OrderItem from '~/models/orderItem.model'
import Product from '~/models/product.model'
import Cart from '~/models/cart.model'

const getAllOrder = async (req, res) => {
    try {
        const { status, search } = req.query
        let filter = {}

        if (status) {
            filter.status = status
        }

        if (search) {
            filter.$or = [{ orderCode: { $regex: search, $options: 'i' } }]
        }

        const orders = await Order.find(filter)
            .populate('user', '-password') // Populate user và ẩn password
            .populate({
                path: 'items',
                populate: {
                    path: 'product', // Populate product trong orderItems
                },
            })
            .populate('shippingAddress')
        res.status(200).json(orders)
    } catch (error) {
        // console.error('Lỗi khi lấy đơn hàng:', error)
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy đơn hàng!' })
    }
}

const createOrder = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Người dùng cần đăng nhập' })
        }

        const { items, shippingAddress, shippingFee, note, banking } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống!' })
        }

        let totalPriceOriginal = 0
        let totalPriceFinal = 0
        const orderItems = []
        let link_payment = ''

        for (const item of items) {
            const product = await Product.findById(item.product._id)

            if (!product) {
                return res.status(404).json({ message: `Sản phẩm với ID ${item.product._id} không tồn tại` })
            }

            // Kiểm tra tồn kho
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng` })
            }

            // Tạo OrderItem
            const orderItem = new OrderItem({
                product: product._id,
                variantId: item.variant._id,
                priceOriginal: product.priceOriginal,
                priceFinal: product.priceFinal || product.priceOriginal, // Nếu không có giá giảm, dùng giá gốc
                quantity: item.quantity,
            })

            await orderItem.save()
            orderItems.push(orderItem._id)

            totalPriceOriginal += product.priceOriginal * item.quantity
            totalPriceFinal += (product.priceFinal || product.priceOriginal) * item.quantity
        }

        const totalPrice = totalPriceFinal + shippingFee
        const orderCode = `NIN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
        if (banking === 1) {
            const momoResponse = await httpRequest.post('/payment/create-payment', {
                amount: totalPrice * 1000,
                orderId: orderCode,
            })

            if (momoResponse && momoResponse.shortLink) {
                link_payment = momoResponse.shortLink // Gán link thanh toán MoMo
            } else {
                return res.status(400).json({ message: 'Không thể tạo thanh toán MoMo!' })
            }
        }

        const newOrder = new Order({
            user: req.user.id,
            items: orderItems,
            shippingAddress: shippingAddress,
            shippingFee,
            totalPriceOriginal,
            totalPriceFinal,
            totalPrice,
            status: 'Pending',
            orderCode,
            note,
            banking,
            link_payment,
        })

        await newOrder.save()

        // Cập nhật tồn kho
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
        }

        await Cart.findOneAndDelete({ user: req.user.id })

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            order: newOrder,
        })
    } catch (error) {
        // console.error('Lỗi khi tạo đơn hàng:', error)
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo đơn hàng!' })
    }
}

const getOrderByUserId = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: 'Người dùng cần đăng nhập' })
        }

        const orders = await Order.find({ user: req.user.id })
            .populate('user', '-password') // Populate user và ẩn password
            .populate({
                path: 'items',
                populate: {
                    path: 'product', // Populate product trong orderItems
                },
            })
            .populate('shippingAddress')

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
        }

        const formattedOrders = orders.map((order) => {
            const orderItems = order.items.map((item) => {
                const product = item.product
                const selectedVariant = product.variant?.find(
                    (v) => item.variantId && v._id.toString() === item.variantId.toString(),
                )

                return {
                    _id: item._id,
                    product: {
                        _id: product._id,
                        name: product.name,
                        stock: product.stock,
                        slug: product.slug,
                        image: selectedVariant?.images?.[0] || product.image,
                        priceOriginal: product.priceOriginal,
                        priceFinal: product.priceFinal || product.priceOriginal,
                    },
                    variant: selectedVariant
                        ? {
                              _id: selectedVariant._id,
                              name: selectedVariant.name,
                          }
                        : null,
                    quantity: item.quantity,
                }
            })

            return {
                ...order.toObject(),
                items: orderItems,
            }
        })

        res.status(200).json({
            message: 'Lấy danh sách đơn hàng thành công!',
            orders: formattedOrders,
        })
    } catch (error) {
        // console.error('Lỗi khi lấy đơn hàng:', error)
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy đơn hàng!' })
    }
}

const updateStatusOrder = async (req, res) => {
    const { status } = req.body

    try {
        await Order.findByIdAndUpdate(req.params.id, { status })

        res.json({ message: `Trạng thái đã cập nhật: ${status}` })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' })
    }
}

const updateProductSold = async (order) => {
    for (let item of order.items) {
        await Product.findByIdAndUpdate(
            item._id,
            {
                $inc: { sold: item.quantity, stock: -item.quantity }, // Tăng sold, giảm stock
            },
            { new: true },
        )
    }
}

module.exports = {
    getAllOrder,
    createOrder,
    getOrderByUserId,
    updateStatusOrder,
}
