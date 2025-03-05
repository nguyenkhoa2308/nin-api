/* eslint-disable no-console */

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'

dotenv.config()

//route
const productRoute = require('~/routes/product.route')
const categoryRoute = require('~/routes/category.route')
const cartRoute = require('~/routes/cart.route')
import userRoute from '~/routes/user.route'
import orderRoute from '~/routes/order.route'
import paymentRoute from '~/routes/payment.route'
import addressRoute from '~/routes/address.route'
import adminRoute from '~/routes/admin.route'
import cancelExpiredOrders from './services/cancelExpiredOrders '

const app = express()
const port = process.env.PORT || 3001
const dbUrl = process.env.MONGODB_URI

//config req.body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//config cors
const corsOpts = {
    origin: '*',
    exposedHeaders: ['Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'X-Request-With'],
}
app.use(cors(corsOpts))

app.use('/api/products', productRoute)
app.use('/api/categories', categoryRoute)
app.use('/api/cart', cartRoute)
app.use('/api/user', userRoute)
app.use('/api/order', orderRoute)
app.use('/api/payment', paymentRoute)
app.use('/api/address', addressRoute)
app.use('/api/admin', adminRoute)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

setInterval(cancelExpiredOrders, 10 * 60000)

mongoose
    .connect(dbUrl)
    .then(() => {
        console.log('Connected to database!')
        app.listen(port, () => {
            console.log('Server is running at port ' + port)
        })
    })
    .catch(() => {
        console.log('Connection failed!')
    })
