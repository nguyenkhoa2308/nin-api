const mongoose = require('mongoose')

const OrderItemSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        priceOriginal: { type: Number, require: true },
        priceFinal: { type: Number, require: false },
        quantity: { type: Number, require: true, default: 1 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

const OrderItem = mongoose.model('OrderItem', OrderItemSchema)

module.exports = OrderItem
