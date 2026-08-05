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
    });
  }
  return transporter;
}

// ─── OTP Email ───
export const sendOTP = async (email, otp) => {
  return getTransporter().sendMail({
    from: `"${getEnv().BREVO_SENDER_NAME}" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: "Your OTP for Ovantra Financial",
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Ovantra Financial</h1>
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
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Ovantra Financial. All rights reserved.</p>
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
    from: `"${getEnv().BREVO_SENDER_NAME}" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: "Welcome to Ovantra Financial!",
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Welcome to Ovantra!</h1>
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
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">&#8226; Start trading with Ovantra Financial</p>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                  <a href="${getEnv().CLIENT_URL || 'http://localhost:3000'}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Go to Dashboard</a>
                </td></tr></table>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Ovantra Financial. All rights reserved.</p>
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
    from: `"${getEnv().BREVO_SENDER_NAME}" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: email,
    subject: "Reset Your Password - Ovantra Financial",
    html: `
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr><td style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px 40px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Password Reset</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Ovantra Financial</p>
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
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Ovantra Financial. All rights reserved.</p>
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
    from: `"${getEnv().BREVO_SENDER_NAME}" <${getEnv().BREVO_SENDER_EMAIL}>`,
    to: referrerEmail,
    subject: "New Referral Sign-Up on Ovantra Financial!",
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
                <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Ovantra Financial. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
  });
};
