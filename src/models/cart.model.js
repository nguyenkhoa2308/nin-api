const mongoose = require('mongoose')

const CartSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
        totalPriceFinal: { type: Number, require: false },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

const Cart = mongoose.model('Cart', CartSchema)

module.exports = Cart
