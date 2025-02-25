const mongoose = require('mongoose')

const AddressSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        detailAddress: { type: String, required: true },
        typeAddress: { type: String, required: false, enum: ['home', 'office'] },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false },
)

module.exports = mongoose.model('Address', AddressSchema)
