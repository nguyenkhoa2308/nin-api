/* eslint-disable no-console */
const Order = require('~/models/order.model') // Import model đơn hàng
const Product = require('~/models/product.model') // Import model đơn hàng

let isProcessing = false

const cancelExpiredOrders = async () => {
    if (isProcessing) {
        console.log('Đang xử lý, bỏ qua lần gọi mới')
        return
    }

    isProcessing = true
    try {
        const now = new Date()
        const expiredTime = new Date(now.getTime() - 101 * 60000)

        const expiredOrders = await Order.find({
            status: 'Pending',
            banking: 1,
            createdAt: { $lt: expiredTime },
        }).populate({
            path: 'items',
            populate: { path: 'product' },
        })

        if (expiredOrders.length > 0) {
            console.log(`Hủy ${expiredOrders.length} đơn hàng Banking quá hạn`)

            for (const order of expiredOrders) {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity },
                    })
                }
            }

            await Order.updateMany(
                { _id: { $in: expiredOrders.map((order) => order._id) } },
                { $set: { status: 'Cancelled' } },
            )
        }
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng Banking:', error)
    } finally {
        isProcessing = false
    }
}

module.exports = cancelExpiredOrders
