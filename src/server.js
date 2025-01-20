/* eslint-disable no-console */

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'

dotenv.config()

//route
const productRoute = require('~/routes/product.route')
const categoryRoute = require('~/routes/category.route')

const app = express()
const port = process.env.PORT || 3001
const dbUrl = process.env.MONGODB_URI

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const corsOpts = {
    origin: '*',
    exposedHeaders: ['Authorization'],

    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'X-Request-With'],
}
app.use(cors(corsOpts))

app.use('/api/products', productRoute)
app.use('/api/categories', categoryRoute)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

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
