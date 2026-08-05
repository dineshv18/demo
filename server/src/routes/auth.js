import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register, adminRegister, login, sendOTPHandler, verifyOTP,
  forgotPassword, resetPassword, getMe, logout,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { bruteForceProtection } from "../middleware/bruteForce.js";

const router = Router();

// Helper function to extract client IP behind reverse proxy (e.g. Nginx, Cloudflare)
const getClientIp = (req) => {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || req.headers["x-real-ip"]
    || req.socket?.remoteAddress
    || "unknown";
};

// Login: 15 attempts per 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
});

// Register: 50 attempts per 15 min (prevent lockout during testing / normal usage)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: "Too many registration attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
});

// OTP: 20 per 10 min
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { message: "Too many OTP requests. Please try again after 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
});

// Forgot password: 15 per 15 min
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: "Too many password reset requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
});

// Reset password: 20 per hour
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: "Too many reset attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
});

// ─── Routes ───
router.post("/register", registerLimiter, register);
router.post("/admin-register", registerLimiter, adminRegister);
router.post("/login", loginLimiter, bruteForceProtection({ maxAttempts: 5, lockoutMs: 30 * 60 * 1000 }), login);
router.post("/send-otp", otpLimiter, sendOTPHandler);
router.post("/verify-otp", otpLimiter, verifyOTP);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
