import nodemailer from "nodemailer";
import getEnv from "./env.js";

let transporter;

export function getTransporter() {
  if (!transporter) {
    const env = getEnv();
    transporter = nodemailer.createTransport({
      host: env.BREVO_SMTP_HOST,
      port: env.BREVO_SMTP_PORT,
      secure: false,
      auth: {
        user: env.BREVO_SMTP_USER,
        pass: env.BREVO_SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

const getBaseHeaders = () => {
  const env = getEnv();
  return {
    "Reply-To": env.BREVO_SENDER_EMAIL,
    "List-Unsubscribe": `<mailto:${env.BREVO_SENDER_EMAIL}?subject=unsubscribe>`,
    "X-Mailer": "ORVANTA Financial",
  };
};

// ─── OTP Email ───
export const sendOTP = async (email, otp) => {
  return getTransporter().sendMail({
    from: `"ORVANTA Financial" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: `Your verification code: ${otp}`,
    headers: getBaseHeaders(),
    text: `Your ORVANTA Financial verification code is: ${otp}\n\nThis code expires in 10 minutes.\nIf you didn't request this, ignore this email.\n\nORVANTA Financial Team`,
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">ORVANTA Financial</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Email Verification</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="color:#374151;font-size:15px;margin:0 0 8px;">Hello,</p>
                <p style="color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">Use the following OTP to verify your email. Valid for <strong>10 minutes</strong>.</p>
                <div style="text-align:center;margin:0 0 24px;">
                  <span style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 40px;border-radius:12px;">${otp}</span>
                </div>
                <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">If you did not request this, ignore this email.</p>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ORVANTA Financial. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
};

// ─── Welcome Email (after OTP verified) ───
export const sendWelcomeEmail = async (email, name) => {
  return getTransporter().sendMail({
    from: `"ORVANTA Financial" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: "Welcome to ORVANTA Financial!",
    headers: getBaseHeaders(),
    text: `Hello ${name},\n\nYour email has been verified and your account is now active.\nYou can start trading Forex and Crypto CFDs on our platform.\n\nGo to your dashboard: ${getEnv().CLIENT_URL || 'http://localhost:3000'}\n\nORVANTA Financial Team`,
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Welcome to ORVANTA!</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Your account is now active</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <div style="text-align:center;margin:0 0 24px;">
                  <div style="width:64px;height:64px;border-radius:50%;background:#ecfdf5;display:inline-flex;align-items:center;justify-content:center;">
                    <span style="font-size:32px;">&#10003;</span>
                  </div>
                </div>
                <p style="color:#374151;font-size:15px;margin:0 0 8px;">Hello ${name},</p>
                <p style="color:#6b7280;font-size:14px;margin:0 0 20px;line-height:1.6;">Your email has been verified and your account is now active. You can start trading Forex and Crypto CFDs on our platform.</p>
                <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:0 0 20px;">
                  <p style="color:#374151;font-size:13px;margin:0 0 8px;font-weight:600;">What you can do:</p>
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">&#8226; Access your trading dashboard</p>
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">&#8226; Fund your account</p>
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">&#8226; Start trading with ORVANTA Financial</p>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                  <a href="${getEnv().CLIENT_URL || 'http://localhost:3000'}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Go to Dashboard</a>
                </td></tr></table>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ORVANTA Financial. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
};

// ─── Reset Password Email ───
export const sendResetPasswordEmail = async (email, name, resetToken) => {
  const resetUrl = `${getEnv().CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  return getTransporter().sendMail({
    from: `"ORVANTA Financial" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: "Reset Your Password — ORVANTA Financial",
    headers: getBaseHeaders(),
    text: `Hello ${name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\nIf you didn't request this, ignore this email.\n\nORVANTA Financial Team`,
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Password Reset</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">ORVANTA Financial</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="color:#374151;font-size:15px;margin:0 0 8px;">Hello ${name},</p>
                <p style="color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">We received a request to reset your password. Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.</p>
                <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                  <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Reset Password</a>
                </td></tr></table>
                <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;text-align:center;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ORVANTA Financial. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
};

// ─── Referral Notification Email ───
export const sendReferralNotification = async (referrerEmail, referrerName, newUserName) => {
  return getTransporter().sendMail({
    from: `"ORVANTA Financial" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: referrerEmail,
    subject: "New Referral Sign-Up on ORVANTA Financial!",
    headers: getBaseHeaders(),
    text: `Hello ${referrerName},\n\n${newUserName} has registered using your referral link.\nWhen they complete KYC and make a deposit, you'll earn a commission!\n\nView your referral dashboard: ${getEnv().CLIENT_URL || 'http://localhost:3000'}/dashboard/referral\n\nORVANTA Financial Team`,
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#d4af37,#c9a84c);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">New Referral!</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Someone joined using your referral code</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="color:#374151;font-size:15px;margin:0 0 8px;">Hello ${referrerName},</p>
                <p style="color:#6b7280;font-size:14px;margin:0 0 20px;line-height:1.6;"><strong>${newUserName}</strong> has registered using your referral link. When they complete KYC and make a deposit, you'll earn a commission!</p>
                <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:0 0 20px;">
                  <p style="color:#374151;font-size:13px;margin:0 0 8px;font-weight:600;">Next Steps:</p>
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">1. User completes KYC verification</p>
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">2. User makes their first deposit</p>
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">3. You earn commission automatically!</p>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                  <a href="${getEnv().CLIENT_URL || 'http://localhost:3000'}/dashboard/referral" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#c9a84c);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">View Referral Dashboard</a>
                </td></tr></table>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ORVANTA Financial. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
};

const CATEGORY_LABELS = {
  TECHNICAL: "Technical",
  BILLING: "Billing / Payment",
  KYC: "KYC",
  ACCOUNT: "Account",
  OTHER: "Other",
};

// ─── Support Ticket: notify admins ───
export const sendSupportTicketAdminNotification = async (adminEmails, ticket, user) => {
  if (!adminEmails.length) return;
  const categoryLabel = CATEGORY_LABELS[ticket.category] || ticket.category;
  const adminUrl = `${getEnv().ADMIN_URL || "http://localhost:5173"}/dashboard/support-tickets`;
  return getTransporter().sendMail({
    from: `"ORVANTA Financial" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: adminEmails,
    subject: `New Support Ticket [${categoryLabel}]: ${ticket.subject}`,
    headers: getBaseHeaders(),
    text: `New support ticket submitted.\n\nFrom: ${user.name} (${user.email})\nCategory: ${categoryLabel}\nSubject: ${ticket.subject}\n\nMessage:\n${ticket.message}\n${ticket.screenshotUrls?.length ? `\n${ticket.screenshotUrls.length} screenshot(s) attached.\n` : ""}\nView in admin panel: ${adminUrl}\n\nORVANTA Financial`,
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">New Support Ticket</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">${categoryLabel}</p>
              </td></tr>
              <tr><td style="padding:36px 40px;">
                <div style="background:#f9fafb;border-radius:12px;padding:18px 20px;margin:0 0 20px;">
                  <p style="color:#374151;font-size:13px;margin:0 0 6px;"><strong>From:</strong> ${user.name} (${user.email})</p>
                  <p style="color:#374151;font-size:13px;margin:0;"><strong>User ID:</strong> ${user.id}</p>
                </div>
                <p style="color:#111827;font-size:15px;font-weight:600;margin:0 0 8px;">${ticket.subject}</p>
                <p style="color:#4b5563;font-size:14px;margin:0 0 ${ticket.screenshotUrls?.length ? "8px" : "24px"};line-height:1.6;white-space:pre-wrap;">${ticket.message}</p>
                ${ticket.screenshotUrls?.length ? `<p style="color:#7c3aed;font-size:12px;font-weight:600;margin:0 0 24px;">${ticket.screenshotUrls.length} screenshot(s) attached — view in admin panel</p>` : ""}
                <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                  <a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">View Ticket</a>
                </td></tr></table>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ORVANTA Financial. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
};

// ─── Support Ticket: confirmation to user ───
export const sendSupportTicketConfirmation = async (userEmail, userName, ticket) => {
  const categoryLabel = CATEGORY_LABELS[ticket.category] || ticket.category;
  return getTransporter().sendMail({
    from: `"ORVANTA Financial" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: userEmail,
    subject: "We've received your support request",
    headers: getBaseHeaders(),
    text: `Hello ${userName},\n\nWe've received your support request and our team will get back to you within 2-3 working hours.\n\nCategory: ${categoryLabel}\nSubject: ${ticket.subject}\n\nYour message:\n${ticket.message}\n\nORVANTA Financial Team`,
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Request Received</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">We're on it</p>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="color:#374151;font-size:15px;margin:0 0 8px;">Hello ${userName},</p>
                <p style="color:#6b7280;font-size:14px;margin:0 0 20px;line-height:1.6;">Thanks for reaching out. Our support team will contact you within <strong>2-3 working hours</strong>.</p>
                <div style="background:#f9fafb;border-radius:12px;padding:18px 20px;margin:0 0 20px;">
                  <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">${categoryLabel}</p>
                  <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 8px;">${ticket.subject}</p>
                  <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6;white-space:pre-wrap;">${ticket.message}</p>
                </div>
                <p style="color:#9ca3af;font-size:12px;margin:0;">We'll follow up by email — no action needed from you right now.</p>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ORVANTA Financial. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
};
