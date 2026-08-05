import { Router } from "express";
import bcrypt from "bcryptjs";
import getPrisma from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { logActivity, trackActivity } from "../middleware/activityLog.js";
import { validatePassword, validateEmail } from "../utils/validation.js";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

// ─── GET ALL ADMINS ───
router.get("/", async (req, res) => {
  try {
    const admins = await getPrisma().user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      select: {
        id: true, name: true, email: true, role: true, isActive: true, isVerified: true,
        assignedRoleId: true, theme: true, lastLoginAt: true, lastLoginIp: true,
        createdAt: true, updatedAt: true,
        assignedRole: { select: { id: true, name: true, displayName: true, color: true, theme: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ admins });
  } catch (error) {
    console.error("Get admins error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── CREATE ADMIN ───
router.post("/", trackActivity("create_admin", "admins"), async (req, res) => {
  try {
    const { name, email, password, assignedRoleId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.errors[0] });
    }

    const existing = await getPrisma().user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    if (assignedRoleId) {
      const role = await getPrisma().role.findUnique({ where: { id: assignedRoleId } });
      if (!role) return res.status(400).json({ message: "Invalid role" });
    }

    const hashed = await bcrypt.hash(password, 14);
    const admin = await getPrisma().user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: "ADMIN",
        isVerified: true,
        isActive: true,
        assignedRoleId: assignedRoleId || null,
      },
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        assignedRoleId: true, createdAt: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: "create_admin",
      page: "admins",
      details: { adminName: admin.name, adminEmail: admin.email },
      req,
    });

    return res.status(201).json({ message: "Admin created", admin });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── UPDATE ADMIN ───
router.put("/:id", trackActivity("update_admin", "admins"), async (req, res) => {
  try {
    const { name, email, assignedRoleId, isActive, theme } = req.body;
    const admin = await getPrisma().user.findUnique({ where: { id: req.params.id } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.role === "SUPER_ADMIN") return res.status(400).json({ message: "Cannot modify super admin" });

    const updated = await getPrisma().user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(assignedRoleId !== undefined && { assignedRoleId: assignedRoleId || null }),
        ...(isActive !== undefined && { isActive }),
        ...(theme !== undefined && { theme }),
      },
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        assignedRoleId: true, theme: true, createdAt: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: "update_admin",
      page: "admins",
      details: { adminName: updated.name, changes: req.body },
      req,
    });

    return res.status(200).json({ message: "Admin updated", admin: updated });
  } catch (error) {
    console.error("Update admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── DEACTIVATE ADMIN ───
router.post("/:id/deactivate", trackActivity("deactivate_admin", "admins"), async (req, res) => {
  try {
    const admin = await getPrisma().user.findUnique({ where: { id: req.params.id } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.role === "SUPER_ADMIN") return res.status(400).json({ message: "Cannot deactivate super admin" });

    await getPrisma().user.update({ where: { id: req.params.id }, data: { isActive: false } });
    await logActivity({ userId: req.user.id, action: "deactivate_admin", page: "admins", details: { adminName: admin.name }, req });
    return res.status(200).json({ message: "Admin deactivated" });
  } catch (error) {
    console.error("Deactivate admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── ACTIVATE ADMIN ───
router.post("/:id/activate", trackActivity("activate_admin", "admins"), async (req, res) => {
  try {
    const admin = await getPrisma().user.findUnique({ where: { id: req.params.id } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await getPrisma().user.update({ where: { id: req.params.id }, data: { isActive: true } });
    await logActivity({ userId: req.user.id, action: "activate_admin", page: "admins", details: { adminName: admin.name }, req });
    return res.status(200).json({ message: "Admin activated" });
  } catch (error) {
    console.error("Activate admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── DELETE ADMIN ───
router.delete("/:id", trackActivity("delete_admin", "admins"), async (req, res) => {
  try {
    const admin = await getPrisma().user.findUnique({ where: { id: req.params.id } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.role === "SUPER_ADMIN") return res.status(400).json({ message: "Cannot delete super admin" });

    await getPrisma().user.delete({ where: { id: req.params.id } });
    await logActivity({ userId: req.user.id, action: "delete_admin", page: "admins", details: { adminName: admin.name }, req });
    return res.status(200).json({ message: "Admin deleted" });
  } catch (error) {
    console.error("Delete admin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
