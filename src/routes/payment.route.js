const express = require('express')
const router = express.Router()
const { createPayment, paymentNotify, callback } = require('~/controllers/payment.controller')

router.post('/create-payment', createPayment)
router.post('/webhook', callback)
router.post('/payment-notify', paymentNotify)

module.exports = router
