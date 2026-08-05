import { Router } from "express";
import getPrisma from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

// ─── GET ALL ACTIVITY LOGS ───
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      getPrisma().activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      getPrisma().activityLog.count({ where }),
    ]);

    return res.status(200).json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get logs error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── GET LOG STATS ───
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalToday, totalWeek, totalMonth, topActions, recentActivity, activeUsers] = await Promise.all([
      getPrisma().activityLog.count({ where: { createdAt: { gte: today } } }),
      getPrisma().activityLog.count({ where: { createdAt: { gte: thisWeek } } }),
      getPrisma().activityLog.count({ where: { createdAt: { gte: thisMonth } } }),
      getPrisma().activityLog.groupBy({
        by: ["action"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      getPrisma().activityLog.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      getPrisma().activityLog.findMany({
        select: { userId: true, user: { select: { id: true, name: true, email: true } } },
        where: { createdAt: { gte: thisWeek } },
        distinct: ["userId"],
      }),
    ]);

    return res.status(200).json({
      stats: {
        today: totalToday,
        thisWeek: totalWeek,
        thisMonth: totalMonth,
      },
      topActions: topActions.map((a) => ({ action: a.action, count: a._count.id })),
      recentActivity,
      activeUsers: activeUsers.map((a) => a.user),
    });
  } catch (error) {
    console.error("Get log stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── GET AVAILABLE ACTIONS ───
router.get("/actions", async (req, res) => {
  try {
    const actions = await getPrisma().activityLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    });
    return res.status(200).json({ actions: actions.map((a) => a.action) });
  } catch (error) {
    console.error("Get actions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
