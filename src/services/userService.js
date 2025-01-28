/* eslint-disable no-console, no-control-regex*/
require('dotenv').config()

import User from '~/models/user.model'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const saltRound = 10

const createUserService = async (email, password, firstName, lastName, displayName, gender, birthDate) => {
    try {
        const user = await User.findOne({ email })

        if (user) {
            console.log(`>>> User exist, chọn 1 email khác: ${email}`)
            return null
        }

        const hashPassword = await bcrypt.hash(password, saltRound)

        let result = await User.create({
            email: email,
            password: hashPassword,
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
            gender: gender,
            birthDate: birthDate,
        })

        return result
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
                    email: user.email,
                    name: user.displayName,
                }

                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
                return {
                    EC: 0,
                    token,
                    user: {
                        email: user.email,
                        name: user.displayName,
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

module.exports = { createUserService, getUserService, loginService }
