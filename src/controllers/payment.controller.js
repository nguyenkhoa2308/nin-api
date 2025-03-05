const axios = require('axios')
const crypto = require('crypto')
const momoConfig = require('../config/momo.config')

import Order from '~/models/order.model'

const createPayment = async (req, res) => {
    try {
        const { amount, orderId } = req.body

        // var orderId = momoConfig.partnerCode + new Date().getTime()
        const requestId = orderId
        const orderInfo = `Thanh toán đơn hàng #${orderId}`

        const rawData = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.returnUrl}&requestId=${requestId}&requestType=payWithMethod`

        const signature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawData).digest('hex')

        const payload = {
            accessKey: momoConfig.accessKey,
            partnerCode: momoConfig.partnerCode,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: momoConfig.returnUrl,
            ipnUrl: momoConfig.notifyUrl,
            extraData: '',
            orderGroupId: '',
            autoCapture: true,
            lang: 'vi',
            requestType: 'payWithMethod',
            signature: signature,
        }

        const response = await axios.post(momoConfig.apiUrl, payload)

        res.status(200).json({ payUrl: response.data.payUrl })
    } catch (error) {
        // console.error('Lỗi thanh toán MoMo:', error)
        res.status(500).send('Có lỗi xảy ra!')
    }
}

const callback = async (req, res) => {
    try {
        const { orderId, resultCode } = req.body

        if (resultCode === 0) {
            // 0 = Thanh toán thành công
            const order = await Order.findOne({ orderCode: orderId })
            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tồn tại' })
            }

            order.status = 'Approved' // Cập nhật trạng thái đơn hàng
            await order.save()
        }

        res.sendStatus(200) // Trả về OK cho Momo
    } catch (error) {
        // console.error('Lỗi xử lý webhook Momo:', error)
        res.status(500).json({ message: 'Lỗi server' })
    }
}

const paymentNotify = async (req, res) => {
    try {
        const { orderId } = req.body

        var secretKey = momoConfig.secretKey
        var accessKey = momoConfig.accessKey
        const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`

        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

        const payload = {
            partnerCode: 'MOMO',
            requestId: orderId,
            orderId: orderId,
            signature: signature,
            lang: 'vi',
        }

        // options for axios
        const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/query', payload)

        return res.status(200).json(response.data)
    } catch (error) {
        // console.error('Lỗi xử lý thông báo:', error)
        res.status(500).send('Có lỗi xảy ra!')
    }
}

module.exports = {
    createPayment,
    paymentNotify,
    callback,
}
