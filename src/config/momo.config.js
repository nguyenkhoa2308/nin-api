require('dotenv').config()

module.exports = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    apiUrl: process.env.MOMO_API_URL,
    returnUrl: process.env.MOMO_RETURN_URL,
    notifyUrl: process.env.MOMO_NOTIFY_URL,
}
