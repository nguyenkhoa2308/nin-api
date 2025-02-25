const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
        totalPriceOriginal: { type: Number, required: true },
        totalPriceFinal: { type: Number, required: false },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Shipping', 'Delivered', 'Received', 'Cancelled', 'Completed'],
        },
        shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
        shippingFee: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        note: { type: String },
        orderCode: { type: String, required: false },
        link_payment: { type: String, required: false },
        banking: { type: Number, required: false, default: 1 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

module.exports = mongoose.model('Order', OrderSchema)
