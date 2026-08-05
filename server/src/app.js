import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import getEnv from "./config/env.js";
import authRoutes from "./routes/auth.js";
import roleRoutes from "./routes/roles.js";
import pageRoutes from "./routes/pages.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import activityRoutes from "./routes/activity.js";
import walletRoutes from "./routes/wallet.js";
import kycRoutes from "./routes/kyc.js";
import adminKycRoutes from "./routes/adminKyc.js";
import adminPaymentsRoutes from "./routes/adminPayments.js";

const app = express();

// Trust reverse proxies (Nginx / Cloudflare) to extract accurate client IP
app.set("trust proxy", 1);

// ─── Helmet (Security Headers) ───
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// ─── CORS ───
app.use(cors({
  origin: getEnv().CORS_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Body Parsing ───
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// ─── Global Rate Limiter ───
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 500,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.headers["x-real-ip"]
      || req.socket?.remoteAddress
      || "unknown";
  },
});
app.use(globalLimiter);

// ─── Admin Rate Limiter (higher limit for authenticated admin routes) ───
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 2000 : 1000,
  message: { message: "Too many admin requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.headers["x-real-ip"]
      || req.socket?.remoteAddress
      || "unknown";
  },
});

// ─── Disable fingerprinting ───
app.disable("x-powered-by");

// ─── Additional Security Headers ───
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

// ─── Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin/kyc", adminLimiter, adminKycRoutes);
app.use("/api/admin/payments", adminLimiter, adminPaymentsRoutes);

// ─── Health Check ───
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    port: getEnv().PORT,
    env: getEnv().NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ─── Global Error Handler ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
