// import mongoose from 'mongoose'
import { createUserService, getUserService, loginService } from '~/services/userService'

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

module.exports = {
    createUser,
    login,
    getUser,
    getAccount,
}
