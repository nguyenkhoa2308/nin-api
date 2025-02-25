const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, resetPasswordLink) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: `
            <div style="font-family: Roboto, sans-serif; width: 600px; margin: auto; color: #000">
                <h2>Chào bạn,</h2>
                <p>Chúng tôi có một thông báo quan trọng dành cho bạn!</p>
                <h2 style="font-weight: 500;">Thiết lập mật khẩu</h2>
                <div style="color: #777;">
                    Click vào đường dẫn dưới đây để thiết lập mật khẩu tài khoản của bạn tại <span><a
                            href="${process.env.FRONTEND_URL}"
                            style="text-decoration: none; display: inline-block; color: #007bff;">NinFurniture</a></span>.
                    Nếu bạn không có yêu
                    cầu thay
                    đổi mật khẩu, xin hãy xóa email này để bảo mật thông tin.</div>
                <br />
                <a href="${resetPasswordLink}"
                    style="background-color: #1666a2; color: #fff; padding: 20px 25px;text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                    Thiết lập mật khẩu
                </a>
                <span style="margin-right: 8px; margin-left: 8px;">hoặc</span>
                <a href="${process.env.FRONTEND_URL}"
                    style="color: #007bff; text-decoration: none; font-size: 16px; display: inline-block;">
                    Đến cửa hàng chúng tôi
                </a>
            </div>
      `,
        // text,
    })
}

module.exports = sendEmail
