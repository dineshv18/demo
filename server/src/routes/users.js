import { Router } from "express";
import getPrisma from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

// ─── GET ALL USERS ───
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, isVerified, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (isVerified !== undefined) where.isVerified = isVerified === "true";
    if (isActive !== undefined) where.isActive = isActive === "true";

    const [users, total] = await Promise.all([
      getPrisma().user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, isVerified: true, isActive: true,
          assignedRoleId: true, theme: true, lastLoginAt: true, lastLoginIp: true,
          createdAt: true, updatedAt: true,
          assignedRole: { select: { id: true, name: true, displayName: true, color: true, theme: true } },
          wallet: { select: { id: true, balance: true, currency: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      getPrisma().user.count({ where }),
    ]);

    return res.status(200).json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── TOGGLE USER ACTIVE STATUS ───
router.post("/:id/toggle-active", async (req, res) => {
  try {
    const user = await getPrisma().user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "SUPER_ADMIN") return res.status(400).json({ message: "Cannot modify super admin" });

    const updated = await getPrisma().user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return res.status(200).json({ message: `User ${updated.isActive ? "activated" : "deactivated"}`, user: updated });
  } catch (error) {
    console.error("Toggle user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── DELETE USER ───
router.delete("/:id", async (req, res) => {
  try {
    const user = await getPrisma().user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "SUPER_ADMIN") return res.status(400).json({ message: "Cannot delete super admin" });

    await getPrisma().user.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── SET USER WALLET CURRENCY (USD only) ───
router.post("/:id/currency", async (req, res) => {
  try {
    const user = await getPrisma().user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "SUPER_ADMIN") return res.status(400).json({ message: "Cannot modify super admin" });

    const wallet = await getPrisma().wallet.upsert({
      where: { userId: user.id },
      update: { currency: "USD" },
      create: { userId: user.id, currency: "USD" },
    });

    return res.status(200).json({ message: "Currency set to USD", wallet });
  } catch (error) {
    console.error("Set currency error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
