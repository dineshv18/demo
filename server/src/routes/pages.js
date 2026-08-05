import { Router } from "express";
import getPrisma from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { logActivity, trackActivity } from "../middleware/activityLog.js";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

// ─── GET ALL PAGES ───
router.get("/", async (req, res) => {
  try {
    const pages = await getPrisma().page.findMany({
      include: {
        roles: {
          include: { role: { select: { id: true, name: true, displayName: true, color: true } } },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return res.status(200).json({ pages });
  } catch (error) {
    console.error("Get pages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── CREATE PAGE ───
router.post("/", trackActivity("create_page", "pages"), async (req, res) => {
  try {
    const { slug, name, description, icon, category } = req.body;
    if (!slug || !name) return res.status(400).json({ message: "Slug and name are required" });

    const existing = await getPrisma().page.findUnique({ where: { slug } });
    if (existing) return res.status(400).json({ message: "Page slug already exists" });

    const page = await getPrisma().page.create({
      data: { slug, name, description, icon, category: category || "general" },
    });

    await logActivity({ userId: req.user.id, action: "create_page", page: "pages", details: { pageName: name }, req });
    return res.status(201).json({ message: "Page created", page });
  } catch (error) {
    console.error("Create page error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── UPDATE PAGE ───
router.put("/:id", trackActivity("update_page", "pages"), async (req, res) => {
  try {
    const { name, description, icon, category, isActive } = req.body;
    const page = await getPrisma().page.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ message: "Page not found" });

    const updated = await getPrisma().page.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await logActivity({ userId: req.user.id, action: "update_page", page: "pages", details: { pageName: updated.name }, req });
    return res.status(200).json({ message: "Page updated", page: updated });
  } catch (error) {
    console.error("Update page error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── DELETE PAGE ───
router.delete("/:id", trackActivity("delete_page", "pages"), async (req, res) => {
  try {
    const page = await getPrisma().page.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ message: "Page not found" });

    await getPrisma().page.delete({ where: { id: req.params.id } });
    await logActivity({ userId: req.user.id, action: "delete_page", page: "pages", details: { pageName: page.name }, req });
    return res.status(200).json({ message: "Page deleted" });
  } catch (error) {
    console.error("Delete page error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ─── SEED DEFAULT PAGES ───
router.post("/seed", async (req, res) => {
  try {
    const defaultPages = [
      { slug: "dashboard", name: "Dashboard", icon: "IconLayoutDashboard", category: "main" },
      { slug: "users", name: "Users", icon: "IconUsers", category: "management" },
      { slug: "roles", name: "Roles", icon: "IconShield", category: "management" },
      { slug: "pages", name: "Pages", icon: "IconFile", category: "management" },
      { slug: "activity", name: "Activity Logs", icon: "IconActivity", category: "management" },
      { slug: "settings", name: "Settings", icon: "IconSettings", category: "system" },
      { slug: "reports", name: "Reports", icon: "IconChartBar", category: "analytics" },
      { slug: "wallet", name: "Wallet", icon: "IconWallet", category: "finance" },
      { slug: "trading", name: "Trading", icon: "IconChartLine", category: "finance" },
      { slug: "exchange", name: "Exchange", icon: "IconExchange", category: "finance" },
      { slug: "news", name: "News", icon: "IconNews", category: "content" },
      { slug: "blog", name: "Blog", icon: "IconSpeakerphone", category: "content" },
    ];

    for (const page of defaultPages) {
      await getPrisma().page.upsert({
        where: { slug: page.slug },
        update: {},
        create: page,
      });
    }

    return res.status(200).json({ message: `${defaultPages.length} pages seeded` });
  } catch (error) {
    console.error("Seed pages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
