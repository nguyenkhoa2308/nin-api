const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
        fullName: { type: String, required: true },
        totalPriceOriginal: { type: Number, require: true },
        totalPriceFinal: { type: Number, require: false },
        status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'] },
        shippingAdress: { type: String, required: true },
        shippingFee: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        note: { type: String },
        orderCode: { type: Number, require: false },
        link_payment: { type: String, require: false },
        banking: { type: Number, require: false, default: 1 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

module.exports = mongoose.model('Order', OrderSchema)
