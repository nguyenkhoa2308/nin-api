/* eslint-disable no-console, no-control-regex*/
require('dotenv').config()
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '~/models/user.model'

const saltRound = 10

const createUserService = async (email, password, firstName, lastName, displayName, gender, birthDate) => {
    try {
        const user = await User.findOne({ email })

        if (user) {
            console.log(`>>> User exist, chọn 1 email khác: ${email}`)
            return {
                EC: 1,
                EM: 'Email đã tồn tại',
            }
        }

        const hashPassword = await bcrypt.hash(password, saltRound)

        // eslint-disable-next-line no-unused-vars
        let result = await User.create({
            email: email,
            password: hashPassword,
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
            gender: gender,
            birthDate: birthDate,
        })

        return { EC: 0, EM: 'Đăng nhập thành công' }
    } catch (error) {
        console.log(error)
        return null
    }
}

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email: email }).lean()
        if (!user) {
            return {
                EC: 1,
                EM: 'Email không hợp lệ',
            }
        } else {
            const isMatchPassword = await bcrypt.compare(password, user.password)
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: 'Password không hợp lệ',
                }
            } else {
                const payload = {
                    id: user._id,
                    email: user.email,
                    name: user.displayName,
                    role: user.role,
                }

                const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
                return {
                    EC: 0,
                    access_token,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.displayName,
                        role: user.role,
                    },
                }
            }
        }
    } catch (error) {
        console.log(error)
        return null
    }
}

const getUserService = async () => {
    try {
        const user = await User.find({}).select('-password')
        return user
    } catch (error) {
        console.log(error)
        return null
    }
}

const getUserByIdService = async (id) => {
    try {
        const user = await User.findOne({ _id: id }).lean().select('-password')
        if (!user) {
            return {
                message: 'User không tồn tại',
            }
        }
        return user
    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = { createUserService, getUserService, loginService, getUserByIdService }
