// ─── In-Memory IP Tracking (production: use Redis) ───
const ipAttempts = new Map();

const CLEANUP_INTERVAL = 15 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

// Cleanup old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipAttempts) {
    if (now - data.windowStart > WINDOW_MS * 2) {
      ipAttempts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || req.headers["x-real-ip"]
    || req.socket?.remoteAddress
    || "unknown";
}

/**
 * Brute-force protection middleware
 * @param {Object} options
 * @param {number} options.maxAttempts - Max failed attempts before lockout (default: 5)
 * @param {number} options.lockoutMs - Lockout duration in ms (default: 15 min)
 * @param {string} options.message - Custom lockout message
 */
export function bruteForceProtection({
  maxAttempts = 5,
  lockoutMs = 15 * 60 * 1000,
  message = "Too many failed attempts. Account locked for 15 minutes.",
} = {}) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const record = ipAttempts.get(ip);

    if (record && now - record.windowStart < WINDOW_MS) {
      if (record.attempts >= maxAttempts) {
        const remainingMs = lockoutMs - (now - record.lockedAt);
        if (remainingMs > 0) {
          const mins = Math.ceil(remainingMs / 60000);
          res.setHeader("Retry-After", Math.ceil(remainingMs / 1000));
          return res.status(429).json({
            message: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.`,
            lockedUntil: new Date(record.lockedAt + lockoutMs).toISOString(),
            retryAfterSeconds: Math.ceil(remainingMs / 1000),
          });
        }
        // Lockout expired, reset
        ipAttempts.delete(ip);
      }
    } else if (record && now - record.windowStart >= WINDOW_MS) {
      // Window expired, reset
      ipAttempts.delete(ip);
    }

    next();
  };
}

/**
 * Record a failed attempt for an IP
 */
export function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = ipAttempts.get(ip);

  if (!record || now - record.windowStart >= WINDOW_MS) {
    ipAttempts.set(ip, {
      attempts: 1,
      windowStart: now,
      lockedAt: null,
    });
  } else {
    record.attempts += 1;
    if (record.attempts >= 5 && !record.lockedAt) {
      record.lockedAt = now;
    }
  }
}

/**
 * Reset attempts for an IP (on successful login)
 */
export function resetAttempts(ip) {
  ipAttempts.delete(ip);
}

/**
 * Get current attempt count for an IP
 */
export function getAttemptCount(ip) {
  const record = ipAttempts.get(ip);
  if (!record || Date.now() - record.windowStart >= WINDOW_MS) return 0;
  return record.attempts;
}
