import { Router } from "express";
import getPrisma from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { logActivity, trackActivity } from "../middleware/activityLog.js";

const router = Router();

// All role routes require SUPER_ADMIN
router.use(authenticate, authorize("SUPER_ADMIN"));

// ─── GET ALL ROLES ───
router.get("/", async (req, res) => {
  try {
    const roles = await getPrisma().role.findMany({
      include: {
        pages: {
          include: { page: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ roles });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── GET SINGLE ROLE ───
router.get("/:id", async (req, res) => {
  try {
    const role = await getPrisma().role.findUnique({
      where: { id: req.params.id },
      include: {
        pages: { include: { page: true } },
        users: { select: { id: true, name: true, email: true, isActive: true } },
      },
    });

    if (!role) return res.status(404).json({ message: "Role not found" });
    return res.status(200).json({ role });
  } catch (error) {
    console.error("Get role error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── CREATE ROLE ───
router.post("/", trackActivity("create_role", "roles"), async (req, res) => {
  try {
    const { name, displayName, description, color, theme } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({ message: "Name and display name are required" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");

    const existing = await getPrisma().role.findUnique({ where: { name: slug } });
    if (existing) return res.status(400).json({ message: "Role name already exists" });

    const role = await getPrisma().role.create({
      data: {
        name: slug,
        displayName,
        description: description || null,
        color: color || "#6366f1",
        theme: theme || "default",
      },
    });

    await logActivity({
      userId: req.user.id,
      action: "create_role",
      page: "roles",
      details: { roleName: displayName, roleId: role.id },
      req,
    });

    return res.status(201).json({ message: "Role created", role });
  } catch (error) {
    console.error("Create role error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── UPDATE ROLE ───
router.put("/:id", trackActivity("update_role", "roles"), async (req, res) => {
  try {
    const { displayName, description, color, theme } = req.body;
    const role = await getPrisma().role.findUnique({ where: { id: req.params.id } });
    if (!role) return res.status(404).json({ message: "Role not found" });
    if (role.isSystem) return res.status(400).json({ message: "Cannot modify system role" });

    const updated = await getPrisma().role.update({
      where: { id: req.params.id },
      data: {
        ...(displayName && { displayName }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(theme && { theme }),
      },
    });

    await logActivity({
      userId: req.user.id,
      action: "update_role",
      page: "roles",
      details: { roleName: updated.displayName },
      req,
    });

    return res.status(200).json({ message: "Role updated", role: updated });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── DELETE ROLE ───
router.delete("/:id", trackActivity("delete_role", "roles"), async (req, res) => {
  try {
    const role = await getPrisma().role.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) return res.status(404).json({ message: "Role not found" });
    if (role.isSystem) return res.status(400).json({ message: "Cannot delete system role" });
    if (role._count.users > 0) return res.status(400).json({ message: "Cannot delete role with assigned users" });

    await getPrisma().role.delete({ where: { id: req.params.id } });

    await logActivity({
      userId: req.user.id,
      action: "delete_role",
      page: "roles",
      details: { roleName: role.displayName },
      req,
    });

    return res.status(200).json({ message: "Role deleted" });
  } catch (error) {
    console.error("Delete role error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── ASSIGN PAGES TO ROLE ───
router.post("/:id/pages", trackActivity("assign_pages", "roles"), async (req, res) => {
  try {
    const { pages } = req.body; // [{ pageId, canView, canCreate, canEdit, canDelete }]
    const role = await getPrisma().role.findUnique({ where: { id: req.params.id } });
    if (!role) return res.status(404).json({ message: "Role not found" });

    // Delete existing assignments
    await getPrisma().rolePage.deleteMany({ where: { roleId: req.params.id } });

    // Create new assignments
    if (pages && pages.length > 0) {
      await getPrisma().rolePage.createMany({
        data: pages.map((p) => ({
          roleId: req.params.id,
          pageId: p.pageId,
          canView: p.canView ?? true,
          canCreate: p.canCreate ?? false,
          canEdit: p.canEdit ?? false,
          canDelete: p.canDelete ?? false,
        })),
      });
    }

    const updated = await getPrisma().role.findUnique({
      where: { id: req.params.id },
      include: { pages: { include: { page: true } } },
    });

    await logActivity({
      userId: req.user.id,
      action: "assign_pages",
      page: "roles",
      details: { roleName: role.displayName, pageCount: pages?.length || 0 },
      req,
    });

    return res.status(200).json({ message: "Pages assigned", role: updated });
  } catch (error) {
    console.error("Assign pages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
