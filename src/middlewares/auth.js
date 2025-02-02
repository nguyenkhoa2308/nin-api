// require('dotenv').config()
/* eslint-disable */

import jwt from 'jsonwebtoken'

const auth = (req, res, next) => { 
    // const white_lists = ['/', '/products', '/categories', '/cart', '/user/login', '/user/register']
    // if (white_lists.find(item => '/api' + item === req.originalUrl)) {
    //     next()
    // } else {
        // console.log(req?.headers?.authorization?.split(' ')[1] !== "null");
        // const authHeader = req?.headers?.authorization;
        // const token = authHeader && authHeader !== "null" ? authHeader.split(' ')[1] : null;
        
        //eslint-disable-next-line     
        if (req?.headers?.authorization?.split(' ')[1] !== "null") {
            const token = req.headers.authorization.split(' ')[1]
            //verify token
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    name: decoded.name,
                }
                // console.log('>>> check token: ', decoded)
                next()
            } catch (error) {
                return res.status(401).json({ message: 'Token không hợp lệ' });
            }

        } else {
            res.status(401).json({ message: 'Phiên đăng nhập hết hạn' });
        }
    // }
}

module.exports = {
    auth,
}
