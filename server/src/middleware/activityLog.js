import getPrisma from "../config/db.js";

/**
 * Log user activity
 */
export async function logActivity({ userId, action, page, details, req }) {
  try {
    const ip = req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim()
      || req?.headers?.["x-real-ip"]
      || req?.socket?.remoteAddress
      || "unknown";

    const userAgent = req?.headers?.["user-agent"] || "unknown";

    await getPrisma().activityLog.create({
      data: {
        userId,
        action,
        page: page || null,
        details: details || undefined,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
}

/**
 * Activity tracking middleware
 */
export function trackActivity(action, page) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        logActivity({
          userId: req.user.id,
          action,
          page,
          details: { method: req.method, path: req.originalUrl },
          req,
        }).catch(() => {});
      }
      return originalJson(data);
    };
    next();
  };
}
