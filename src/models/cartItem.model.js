const mongoose = require('mongoose')

const CartItemSchema = mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, require, default: 1 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

const CartItem = mongoose.model('CartItem', CartItemSchema)

module.exports = CartItem
