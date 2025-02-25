const mongoose = require('mongoose')

const OrderItemSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
        priceOriginal: { type: Number, required: true },
        priceFinal: { type: Number, required: false },
        quantity: { type: Number, required: true, default: 1 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

const OrderItem = mongoose.model('OrderItem', OrderItemSchema)

module.exports = OrderItem
