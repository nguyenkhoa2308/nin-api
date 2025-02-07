// import mongoose from 'mongoose'
import { createUserService, getUserService, loginService, getUserByIdService } from '~/services/userService'
import User from '~/models/user.model'
import jwt from 'jsonwebtoken'
require('dotenv').config()

const createUser = async (req, res) => {
    const { email, password, firstName, lastName, displayName, gender, birthDate } = req.body
    const data = await createUserService(email, password, firstName, lastName, displayName, gender, birthDate)
    return res.status(200).json(data)
}

const login = async (req, res) => {
    const { email, password } = req.body
    const data = await loginService(email, password)
    return res.status(200).json(data)
}

const getUser = async (req, res) => {
    const data = await getUserService()
    return res.status(200).json(data)
}

const getAccount = async (req, res) => {
    return res.status(200).json(req.user)
}

const getUserById = async (req, res) => {
    const id = req.params.id
    const data = await getUserByIdService(id)
    return res.status(200).json(data)
}

const updateUser = async (req, res) => {
    try {
        if (req.user.id) {
            const { firstName, lastName, displayName, gender, birthDate } = req.body
            const updateUser = await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $set: {
                        firstName: firstName,
                        lastName: lastName,
                        displayName: displayName,
                        gender: gender,
                        birthDate: birthDate,
                    },
                },
                { new: true },
            )

            const payload = {
                id: updateUser._id,
                email: updateUser.email,
                name: updateUser.displayName,
            }

            const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

            return res.status(200).json({ updateUser, access_token, EC: 0 })
        } else {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createUser,
    login,
    getUser,
    getAccount,
    getUserById,
    updateUser,
}
