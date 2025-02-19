const mongoose = require('mongoose')

const AddressSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: String,
        phone: String,
        province: String,
        district: String,
        ward: String,
        street: String,
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false },
)

module.exports = mongoose.model('Address', AddressSchema)
