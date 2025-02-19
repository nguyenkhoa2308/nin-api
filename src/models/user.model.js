// const mongoose = require('mongoose')
import mongoose from 'mongoose'
// const bcryptjs = require('bcryptjs')

const UserSchema = mongoose.Schema(
    {
        email: { type: String, require: true, unique: true },
        password: { type: String, require: true },
        firstName: { type: String, require: true },
        lastName: { type: String, require: true },
        displayName: { type: String, require: true },
        gender: { type: Boolean, require: true },
        birthDate: { type: String, require: true },
        addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
        role: { type: String, default: 'customer' },
        // status: { type: Number, require: false },
        otpCode: { type: String, require: false },
        otpExpiryTime: { type: Date, require: false },
    },
    { timestamps: true, versionKey: false },
)

const User = mongoose.model('User', UserSchema)

module.exports = User
