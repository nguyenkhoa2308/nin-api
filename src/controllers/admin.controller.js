import Order from '~/models/order.model'
import Product from '~/models/product.model'
import User from '~/models/user.model'

const getStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments()
        const totalOrders = await Order.countDocuments()
        const totalUsers = await User.countDocuments()

        // Chỉ lấy đơn hàng có trạng thái "delivered" hoặc "completed"
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $in: ['Received'] } } },
            { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
        ])

        // Doanh thu theo tháng chỉ lấy đơn hàng đã hoàn thành
        const monthlySales = await Order.aggregate([
            { $match: { status: { $in: ['Received'] } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$totalPrice' },
                },
            },
            { $sort: { _id: 1 } },
        ])

        const salesData = monthlySales.map((item) => ({
            month: `Tháng ${item._id}`,
            revenue: item.revenue,
        }))

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue: totalRevenue[0]?.revenue || 0,
            sales: salesData,
        })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error })
    }
}

module.exports = {
    getStats,
}
