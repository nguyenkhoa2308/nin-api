/* eslint-disable indent */
import httpRequest from '~/utils/httpRequest'
import Order from '~/models/order.model'
import OrderItem from '~/models/orderItem.model'
import Product from '~/models/product.model'
import Cart from '~/models/cart.model'

const getAllOrder = async (req, res) => {
    try {
        const { status, search } = req.query
        const filter = {
            ...(status && { status }),
            ...(search && { $or: [{ orderCode: { $regex: search, $options: 'i' } }] }),
        }

        const orders = await Order.find(filter)
            .populate('user', '-password')
            .populate({ path: 'items', populate: { path: 'product' } })
            .populate('shippingAddress')

        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy đơn hàng!' })
    }
}

const createOrder = async (req, res) => {
    try {
        if (!req.user.id) return res.status(401).json({ message: 'Người dùng cần đăng nhập' })

        const { items, shippingAddress, shippingFee, note, banking } = req.body
        if (!items?.length) return res.status(400).json({ message: 'Giỏ hàng trống!' })

        let totalPriceOriginal = 0,
            totalPriceFinal = 0,
            orderItems = [],
            link_payment = ''

        for (const {
            product: { _id: productId },
            variant,
            quantity,
        } of items) {
            const product = await Product.findById(productId)
            if (!product) return res.status(404).json({ message: `Sản phẩm với ID ${productId} không tồn tại` })
            if (product.stock < quantity)
                return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng` })

            const orderItem = await new OrderItem({
                product: product._id,
                variantId: variant._id,
                priceOriginal: product.priceOriginal,
                priceFinal: product.priceFinal || product.priceOriginal,
                quantity,
            }).save()

            orderItems.push(orderItem._id)
            totalPriceOriginal += product.priceOriginal * quantity
            totalPriceFinal += (product.priceFinal || product.priceOriginal) * quantity
        }

        const totalPrice = totalPriceFinal + shippingFee
        const orderCode = `NIN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

        if (banking === 1) {
            const momoResponse = await httpRequest.post('/payment/create-payment', {
                amount: totalPrice * 1000,
                orderId: orderCode,
            })
            if (!momoResponse?.shortLink) return res.status(400).json({ message: 'Không thể tạo thanh toán MoMo!' })
            link_payment = momoResponse.shortLink
        }

        const newOrder = await new Order({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            shippingFee,
            totalPriceOriginal,
            totalPriceFinal,
            totalPrice,
            status: 'Pending',
            orderCode,
            note,
            banking,
            link_payment,
        }).save()

        for (const {
            product: { _id },
            quantity,
        } of items) {
            await Product.findByIdAndUpdate(_id, { $inc: { stock: -quantity, sold: quantity } })
        }

        await Cart.findOneAndDelete({ user: req.user.id })
        res.status(201).json({ message: 'Đặt hàng thành công!', order: newOrder })
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo đơn hàng!' })
    }
}

const getOrderByUserId = async (req, res) => {
    try {
        if (!req.user.id) return res.status(401).json({ message: 'Người dùng cần đăng nhập' })

        const orders = await Order.find({ user: req.user.id })
            .populate('user', '-password')
            .populate({ path: 'items', populate: { path: 'product' } })
            .populate('shippingAddress')

        if (!orders.length) return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })

        res.status(200).json({
            message: 'Lấy danh sách đơn hàng thành công!',
            orders: orders.map((order) => ({
                ...order.toObject(),
                items: order.items.map(({ _id, product, variantId, quantity }) => {
                    const selectedVariant = product.variant?.find((v) => v._id.toString() === variantId?.toString())
                    return {
                        _id,
                        product: {
                            _id: product._id,
                            name: product.name,
                            stock: product.stock,
                            slug: product.slug,
                            image: selectedVariant?.images?.[0] || product.image,
                            priceOriginal: product.priceOriginal,
                            priceFinal: product.priceFinal || product.priceOriginal,
                        },
                        variant: selectedVariant ? { _id: selectedVariant._id, name: selectedVariant.name } : null,
                        quantity,
                    }
                }),
            })),
        })
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy đơn hàng!' })
    }
}

const updateStatusOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate({ path: 'items', populate: { path: 'product' } })
        if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' })

        if (req.body.status === 'Cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } })
            }
        }

        order.status = req.body.status
        await order.save()

        res.json({ message: `Trạng thái đã cập nhật: ${req.body.status}` })
    } catch (error) {
        console.log(error)

        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' })
    }
}

module.exports = { getAllOrder, createOrder, getOrderByUserId, updateStatusOrder }
