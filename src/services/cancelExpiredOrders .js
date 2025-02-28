/* eslint-disable no-console */
const Order = require('~/models/order.model') // Import model đơn hàng
const Product = require('~/models/product.model') // Import model đơn hàng

const cancelExpiredOrders = async () => {
    try {
        const now = new Date()
        const expiredTime = new Date(now.getTime() - 101 * 60000) // 101 phút trước

        // Tìm đơn hàng Banking chưa thanh toán và đã quá hạn
        const expiredOrders = await Order.find({
            status: 'Pending',
            banking: 1, // Chỉ kiểm tra đơn Banking
            createdAt: { $lt: expiredTime },
        }).populate({
            path: 'items',
            populate: {
                path: 'product', // Populate product trong orderItems
            },
        })

        // console.log(expiredOrders)

        if (expiredOrders.length > 0) {
            console.log(`Hủy ${expiredOrders.length} đơn hàng Banking quá hạn`)

            for (const order of expiredOrders) {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity }, // Cộng lại số lượng
                    })
                }
            }

            // Cập nhật trạng thái đơn hàng thành 'canceled'
            await Order.updateMany(
                { _id: { $in: expiredOrders.map((order) => order._id) } },
                { $set: { status: 'Cancelled' } },
            )
        }
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng Banking:', error)
    }
}

module.exports = cancelExpiredOrders
