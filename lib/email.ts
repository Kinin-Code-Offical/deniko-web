import nodemailer from "nodemailer"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

const transporter = nodemailer.createTransport({
  pool: true,
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  maxConnections: 5,
  maxMessages: 100,
})



function getVerificationEmailTemplate(url: string, lang: Locale, content: any) {
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased; }
    .container { width: 100%; background-color: #f8fafc; padding: 40px 0; }
    .card { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0; }
    .header-accent { height: 8px; background: linear-gradient(90deg, #2563EB 0%, #3B82F6 100%); width: 100%; }
    .header { text-align: center; padding: 40px 40px 20px 40px; }
    .logo { height: 48px; width: auto; }
    .content { padding: 0 48px 48px 48px; text-align: center; }
    .title { color: #0f172a; font-size: 28px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.5px; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
    .button-container { margin-bottom: 32px; }
    .button { display: inline-block; background-color: #2563EB; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s; }
    .button:hover { background-color: #1d4ed8; box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3); transform: translateY(-1px); }
    .divider { border-top: 1px solid #f1f5f9; margin: 0 48px; }
    .footer { padding: 32px 48px; text-align: center; color: #94a3b8; font-size: 13px; line-height: 1.5; background-color: #fcfcfc; }
    .footer-links { margin-top: 12px; }
    .footer-link { color: #64748b; text-decoration: none; margin: 0 8px; }
    .footer-link:hover { color: #2563EB; text-decoration: underline; }
    
    @media only screen and (max-width: 600px) {
      .container { padding: 20px 0; }
      .card { border-radius: 0; border: none; box-shadow: none; }
      .content { padding: 0 24px 40px 24px; }
      .header { padding: 32px 24px 20px 24px; }
      .divider { margin: 0 24px; }
      .footer { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header-accent"></div>
      <div class="header">
        <!-- Replace with your actual logo URL -->
        <img src="https://deniko.net/logo.png" alt="Deniko" class="logo" style="display: block; margin: 0 auto;">
      </div>
      <div class="content">
        <h1 class="title">${content.title}</h1>
        <p class="text">
          ${content.greeting}<br><br>
          ${content.body}
        </p>
        <div class="button-container">
          <a href="${url}" class="button" style="color: #ffffff;">${content.button}</a>
        </div>
        <p class="text" style="font-size: 14px; color: #94a3b8; margin-bottom: 0;">
          ${content.ignore}
        </p>
      </div>
      <div class="divider"></div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">${content.footer}</p>
        <div class="footer-links">
          <a href="${process.env.NEXTAUTH_URL}" class="footer-link">${content.website}</a> • 
          <a href="mailto:support@deniko.net" class="footer-link">${content.support}</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
} export async function sendVerificationEmail(email: string, token: string, lang: Locale = "tr") {
  const confirmLink = `${process.env.NEXTAUTH_URL}/${lang}/verify?token=${token}`

  const dictionary = await getDictionary(lang)
  // @ts-ignore
  const content = dictionary.email.verification

  const html = getVerificationEmailTemplate(confirmLink, lang, content);

  try {
    await transporter.sendMail({
      from: `"Deniko" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: content.subject,
      html: html,
    })
    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: "Failed to send email" }
  }
}
