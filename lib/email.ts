import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

const emailContent = {
    tr: {
        subject: "Deniko Hesabınızı Doğrulayın",
        title: "Deniko'ya Hoş Geldiniz!",
        greeting: "Merhaba,",
        body: "Deniko hesabınızı oluşturduğunuz için teşekkür ederiz. Hesabınızı aktif hale getirmek ve öğrenme yolculuğunuza başlamak için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.",
        button: "Hesabımı Doğrula",
        ignore: "Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.",
        footer: "© 2025 Deniko Eğitim Platformu"
    },
    en: {
        subject: "Verify Your Deniko Account",
        title: "Welcome to Deniko!",
        greeting: "Hello,",
        body: "Thank you for creating your Deniko account. To activate your account and start your learning journey, please verify your email address by clicking the button below.",
        button: "Verify My Account",
        ignore: "If you did not perform this action, you can safely ignore this email.",
        footer: "© 2025 Deniko Education Platform"
    }
}

export async function sendVerificationEmail(email: string, token: string, lang: "tr" | "en" = "tr") {
    const confirmLink = `${process.env.NEXTAUTH_URL}/${lang}/verify?token=${token}`
    const content = emailContent[lang] || emailContent.tr

    const mailOptions = {
        from: `"Deniko" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: content.subject,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7ff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 0 30px 0; background-color: #ffffff;">
                    <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Deniko</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">${content.title}</h2>
                    <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                      ${content.greeting}
                    </p>
                    <p style="margin: 0 0 32px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                      ${content.body}
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${confirmLink}" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s ease;">
                            ${content.button}
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 32px 0 0 0; color: #94a3b8; font-size: 14px; line-height: 1.5; text-align: center;">
                      ${content.ignore}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                      ${content.footer}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    }

    await transporter.sendMail(mailOptions)
}
