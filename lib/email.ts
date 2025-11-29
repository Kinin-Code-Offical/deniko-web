import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export async function sendVerificationEmail(email: string, token: string) {
    const confirmLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}`

    const mailOptions = {
        from: `"Deniko" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Deniko Hesabınızı Doğrulayın",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Deniko'ya Hoş Geldiniz!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">
          Merhaba,
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">
          Deniko hesabınızı oluşturduğunuz için teşekkür ederiz. Hesabınızı aktif hale getirmek için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Hesabımı Doğrula
          </a>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.5;">
          Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2025 Deniko Education Platform
        </p>
      </div>
    `,
    }

    await transporter.sendMail(mailOptions)
}
