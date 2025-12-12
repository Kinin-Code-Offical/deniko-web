import nodemailer from "nodemailer";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import logger from "@/lib/logger";
import { env } from "@/lib/env";

// System / No-Reply Transporter
const noReplyTransporter = nodemailer.createTransport({
  pool: true,
  host: env.SMTP_NOREPLY_HOST,
  port: parseInt(env.SMTP_NOREPLY_PORT),
  secure: parseInt(env.SMTP_NOREPLY_PORT) === 465,
  auth: {
    user: env.SMTP_NOREPLY_USER,
    pass: env.SMTP_NOREPLY_PASSWORD,
  },
  maxConnections: 5,
  maxMessages: 100,
});

// Support Transporter
const supportTransporter = nodemailer.createTransport({
  pool: true,
  host: env.SMTP_SUPPORT_HOST,
  port: parseInt(env.SMTP_SUPPORT_PORT),
  secure: parseInt(env.SMTP_SUPPORT_PORT) === 465,
  auth: {
    user: env.SMTP_SUPPORT_USER,
    pass: env.SMTP_SUPPORT_PASSWORD,
  },
  maxConnections: 5,
  maxMessages: 100,
});

/**
 * Sends a password reset email to the user.
 *
 * @param email - The recipient's email address.
 * @param token - The password reset token.
 * @param lang - The language locale.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  lang: string = "tr"
) {
  try {
    const dictionary = await getDictionary(lang as Locale);
    const resetLink = `${env.NEXTAUTH_URL}/${lang}/reset-password?token=${token}`;

    const content = dictionary.email.password_reset;

    const html = getVerificationEmailTemplate(
      resetLink,
      lang as Locale,
      content
    );

    await noReplyTransporter.sendMail({
      from: `"Deniko" <${env.SMTP_NOREPLY_FROM}>`,
      to: email,
      subject: content.subject,
      html,
    });
  } catch (error) {
    logger.error(
      { context: "sendPasswordResetEmail", error },
      "Failed to send password reset email"
    );
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Sends a support ticket email to the support team.
 */
export async function sendSupportTicketEmail(data: {
  ticketId: string;
  type: string;
  name: string;
  email: string;
  message: string;
}) {
  try {
    await supportTransporter.sendMail({
      from: `"Deniko Support" <${env.SMTP_SUPPORT_FROM}>`,
      to: env.SMTP_SUPPORT_USER, // Send to support team inbox
      replyTo: data.email,
      subject: `[${data.ticketId}] ${data.type}: ${data.name}`,
      text: `
New Support Ticket

Ticket ID: ${data.ticketId}
Type: ${data.type}
From: ${data.name} (${data.email})

Message:
${data.message}
      `,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Support Ticket</h2>
          <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
          <p><strong>Type:</strong> ${data.type}</p>
          <p><strong>From:</strong> ${data.name} (<a href="mailto:${data.email}">${data.email}</a>)</p>
          <hr />
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error(
      { context: "sendSupportTicketEmail", error },
      "Failed to send support ticket email"
    );
    throw error;
  }
}

import type { Dictionary } from "@/types/i18n";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getVerificationEmailTemplate(
  url: string,
  lang: Locale,
  content: Dictionary["email"]["verification"]
) {
  const safeUrl = escapeHtml(url);
  const safeLang = escapeHtml(lang);

  return `
<!DOCTYPE html>
<html lang="${safeLang}">
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
          <a href="${safeUrl}" class="button" style="color: #ffffff;">${content.button}</a>
        </div>
        <p class="text" style="font-size: 14px; color: #94a3b8; margin-bottom: 0;">
          ${content.ignore}
        </p>
      </div>
      <div class="divider"></div>
      <div class="footer">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding-bottom: 16px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                ${content.footer_disclaimer}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                ${content.footer_address}
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                ${content.footer_copyright}
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5;">
                <a href="${env.NEXTAUTH_URL}/${safeLang}/legal/terms" style="color: #2062A3; text-decoration: none;">${content.footer_terms}</a>
                <span style="color: #d1d5db; margin: 0 8px;">|</span>
                <a href="${env.NEXTAUTH_URL}/${safeLang}/legal/privacy" style="color: #2062A3; text-decoration: none;">${content.footer_privacy}</a>
                <span style="color: #d1d5db; margin: 0 8px;">|</span>
                <a href="${env.NEXTAUTH_URL}/${safeLang}/support" style="color: #2062A3; text-decoration: none;">${content.support}</a>
              </p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
    `;
}

/**
 * Sends a verification email to the user.
 *
 * @param email - The recipient's email address.
 * @param token - The verification token.
 * @param lang - The language locale.
 * @returns An object indicating success or failure.
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  lang: Locale = "tr"
) {
  const confirmLink = `${env.NEXTAUTH_URL}/${lang}/verify?token=${token}`;

  const dictionary = await getDictionary(lang);
  const content = dictionary.email.verification;

  const html = getVerificationEmailTemplate(confirmLink, lang, content);

  try {
    await noReplyTransporter.sendMail({
      from: `"Deniko" <${env.SMTP_NOREPLY_FROM}>`,
      to: email,
      subject: content.subject,
      html: html,
    });
    return { success: true };
  } catch (error) {
    logger.error(
      { context: "sendVerificationEmail", error },
      "Email sending failed"
    );
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Sends an email change verification email to the user.
 *
 * @param email - The new email address.
 * @param token - The verification token.
 * @param lang - The language locale.
 */
export async function sendEmailChangeVerificationEmail(
  email: string,
  token: string,
  lang: Locale = "tr"
) {
  const confirmLink = `${env.NEXTAUTH_URL}/${lang}/verify-email-change/${token}`;

  const dictionary = await getDictionary(lang);
  const content = dictionary.email.email_change;

  const html = getVerificationEmailTemplate(confirmLink, lang, content);

  try {
    await noReplyTransporter.sendMail({
      from: `"Deniko" <${env.SMTP_NOREPLY_FROM}>`,
      to: email,
      subject: content.subject,
      html: html,
    });
    return { success: true };
  } catch (error) {
    logger.error(
      { context: "sendEmailChangeVerificationEmail", error },
      "Email sending failed"
    );
    return { success: false, error: "Failed to send email" };
  }
}

