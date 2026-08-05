import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import getPrisma from "../config/db.js";
import { sendOTP, sendWelcomeEmail, sendResetPasswordEmail } from "../config/nodemailer.js";
import getEnv from "../config/env.js";
import { validatePassword, validateEmail } from "../utils/validation.js";
import { recordFailedAttempt, resetAttempts } from "../middleware/bruteForce.js";

const BCRYPT_ROUNDS = 14;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const generateOTP = () => {
  const buffer = crypto.randomBytes(OTP_LENGTH);
  return Array.from(buffer, (b) => b % 10).join("");
};

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, v: 1 }, getEnv().JWT_SECRET, {
    expiresIn: getEnv().JWT_EXPIRES_IN,
    issuer: "ovantra-financial",
    audience: user.role.toLowerCase(),
  });

const cookieOptions = {
  httpOnly: true,
  secure: getEnv().NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function getClientIpFromReq(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || req.headers["x-real-ip"]
    || req.socket?.remoteAddress
    || "unknown";
}

// ─── REGISTER (Client users only) ───
export const register = async (req, res) => {
  try {
    const { name, email, password, ref } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.errors[0], errors: passwordCheck.errors });
    }

    const existing = await getPrisma().user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Always USER role for client registration
    const userRole = "USER";

    // Auto-assign "user" role
    let assignedRoleId = null;
    const assignedRole = await getPrisma().role.findUnique({ where: { name: "user" } });
    if (assignedRole) assignedRoleId = assignedRole.id;

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await getPrisma().user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed, role: userRole, assignedRoleId },
    });

    if (ref) {
      const referrer = await getPrisma().user.findFirst({ where: { referralCode: ref } });
      if (referrer && referrer.id !== user.id) {
        await getPrisma().referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            code: ref,
            status: "REGISTERED",
          },
        });
        try {
          const { sendReferralNotification } = await import("../config/nodemailer.js");
          await sendReferralNotification(referrer.email, referrer.name, user.name);
        } catch (e) { console.error("Referral notification email failed:", e); }
      }
    }

    const otp = generateOTP();
    await getPrisma().user.update({
      where: { id: user.id },
      data: { otp, otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS) },
    });
    await sendOTP(email, otp);

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      message: "Registration successful. OTP sent to your email.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
      requiresOTP: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── ADMIN REGISTER (Admin panel only) ───
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.errors[0], errors: passwordCheck.errors });
    }

    const existing = await getPrisma().user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Always ADMIN role for admin registration
    let assignedRoleId = null;
    const assignedRole = await getPrisma().role.findUnique({ where: { name: "admin" } });
    if (assignedRole) assignedRoleId = assignedRole.id;

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await getPrisma().user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: "ADMIN",
        isVerified: true,
        assignedRoleId,
      },
    });

    const otp = generateOTP();
    await getPrisma().user.update({
      where: { id: user.id },
      data: { otp, otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS) },
    });
    await sendOTP(email, otp);

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      message: "Admin registration successful. OTP sent to your email.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
      requiresOTP: true,
    });
  } catch (error) {
    console.error("Admin register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── LOGIN ───
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const ip = getClientIpFromReq(req);
    const user = await getPrisma().user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        assignedRole: {
          select: {
            id: true, name: true, displayName: true, color: true, theme: true,
            pages: {
              select: {
                canView: true, canCreate: true, canEdit: true, canDelete: true,
                page: { select: { id: true, slug: true, name: true, icon: true, category: true } },
              },
            },
          },
        },
      },
    });

    // Constant-time response to prevent user enumeration
    if (!user) {
      recordFailedAttempt(ip);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check account lockout
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const mins = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        message: `Account locked due to too many failed attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.`,
        retryAfterSeconds: Math.ceil(remainingMs / 1000),
      });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const newAttempts = user.failedAttempts + 1;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the account
        await getPrisma().user.update({
          where: { id: user.id },
          data: {
            failedAttempts: newAttempts,
            lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
            lastFailedLogin: new Date(),
          },
        });
        recordFailedAttempt(ip);

        console.warn(`[SECURITY] Account locked: ${email} (${ip}) - ${newAttempts} failed attempts`);
        return res.status(423).json({
          message: `Account locked due to ${newAttempts} failed attempts. Try again in 30 minutes.`,
          retryAfterSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        });
      }

      await getPrisma().user.update({
        where: { id: user.id },
        data: { failedAttempts: newAttempts, lastFailedLogin: new Date() },
      });
      recordFailedAttempt(ip);

      const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
      return res.status(401).json({
        message: "Invalid email or password",
        attemptsRemaining: remaining,
      });
    }

    // Success - reset all counters
    resetAttempts(ip);
    await getPrisma().user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null, lastFailedLogin: null },
    });

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, assignedRoleId: user.assignedRoleId, assignedRole: user.assignedRole ?? null },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── SEND OTP ───
export const sendOTPHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await getPrisma().user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    await getPrisma().user.update({
      where: { id: user.id },
      data: { otp, otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS) },
    });
    await sendOTP(email, otp);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── VERIFY OTP ───
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be a 6-digit number" });
    }

    const user = await getPrisma().user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    await getPrisma().user.update({
      where: { id: user.id },
      data: { isVerified: true, otp: null, otpExpiry: null },
    });

    try { await sendWelcomeEmail(email, user.name); } catch (e) { console.error("Welcome email failed:", e); }

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── FORGOT PASSWORD ───
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await getPrisma().user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await getPrisma().user.update({ where: { id: user.id }, data: { resetToken, resetExpiry } });
    await sendResetPasswordEmail(email, user.name, resetToken);

    return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── RESET PASSWORD ───
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.errors[0], errors: passwordCheck.errors });
    }

    const user = await getPrisma().user.findFirst({ where: { resetToken: token } });
    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });
    if (user.resetExpiry && new Date() > user.resetExpiry) {
      return res.status(400).json({ message: "Reset token expired. Request a new one." });
    }

    // Check if new password is same as old
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different from the current password" });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await getPrisma().user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetExpiry: null,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    return res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET CURRENT USER ───
export const getMe = async (req, res) => {
  try {
    const user = await getPrisma().user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, isActive: true, isVerified: true,
        assignedRoleId: true, theme: true, createdAt: true,
        assignedRole: {
          select: {
            id: true, name: true, displayName: true, color: true, theme: true,
            pages: {
              select: {
                canView: true, canCreate: true, canEdit: true, canDelete: true,
                page: { select: { id: true, slug: true, name: true, icon: true, category: true } },
              },
            },
          },
        },
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── LOGOUT ───
export const logout = async (req, res) => {
  res.clearCookie("token", { path: "/" });
  return res.status(200).json({ message: "Logged out successfully" });
};
