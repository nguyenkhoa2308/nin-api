const express = require('express')
const router = express.Router()
const { createPayment, paymentNotify } = require('~/controllers/payment.controller')

router.post('/create-payment', createPayment)
router.post('/payment-notify', paymentNotify)

module.exports = router
