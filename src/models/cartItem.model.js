const mongoose = require('mongoose')

const CartItemSchema = mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true, default: 1 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

const CartItem = mongoose.model('CartItem', CartItemSchema)

module.exports = CartItem
