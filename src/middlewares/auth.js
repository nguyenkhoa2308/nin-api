// require('dotenv').config()
/* eslint-disable */

import jwt from 'jsonwebtoken'

const auth = (req, res, next) => { 
    // const white_lists = ['/', '/products', '/categories', '/cart', '/user/login', '/user/register']
    // if (white_lists.find(item => '/api' + item === req.originalUrl)) {
    //     next()
    // } else {
        //eslint-disable-next-line
        if (req?.headers?.authorization?.split(' ')[1]) {
            const token = req.headers.authorization.split(' ')[1]
            //verify token
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                req.user = {
                    email: decoded.email,
                    name: decoded.name,
                }
                // console.log('>>> check token: ', decoded)
                next()
            } catch (error) {
                return null
            }

        } else {
            return null
        }
    // }
}

module.exports = {
    auth
}
