import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PAGES = [
  { slug: "dashboard", name: "Dashboard", icon: "IconLayoutDashboard", category: "main" },
  { slug: "users", name: "Users", icon: "IconUsers", category: "management" },
  { slug: "admins", name: "Admins", icon: "IconUserCircle", category: "management" },
  { slug: "roles", name: "Roles", icon: "IconShield", category: "management" },
  { slug: "pages", name: "Pages", icon: "IconFile", category: "management" },
  { slug: "kyc", name: "KYC Verification", icon: "IconUserCheck", category: "management" },
  { slug: "payments", name: "Payment Requests", icon: "IconWallet", category: "management" },
  { slug: "support", name: "Support Team", icon: "IconHeadset", category: "management" },
  { slug: "activity", name: "Activity Logs", icon: "IconActivity", category: "management" },
  { slug: "settings", name: "Settings", icon: "IconSettings", category: "system" },
  { slug: "reports", name: "Reports", icon: "IconChartBar", category: "analytics" },
  { slug: "wallet", name: "Wallet", icon: "IconWallet", category: "finance" },
  { slug: "trading", name: "Trading", icon: "IconChartLine", category: "finance" },
  { slug: "exchange", name: "Exchange", icon: "IconExchange", category: "finance" },
  { slug: "news", name: "News", icon: "IconNews", category: "content" },
  { slug: "blog", name: "Blog", icon: "IconSpeakerphone", category: "content" },
  { slug: "index", name: "Index", icon: "IconChartLine", category: "finance" },
  { slug: "index-settings", name: "Index Settings", icon: "IconSettings", category: "management" },
];

const DEFAULT_ROLES = [
  { name: "super_admin", displayName: "Super Admin", description: "Full system access", color: "#000000", theme: "dark", isSystem: true },
  { name: "admin", displayName: "Admin", description: "Standard admin access", color: "#6366f1", theme: "default" },
  { name: "manager", displayName: "Manager", description: "Management access", color: "#f97316", theme: "default" },
  { name: "analyst", displayName: "Analyst", description: "Read-only analytics", color: "#06b6d4", theme: "default" },
  { name: "support", displayName: "Support", description: "KYC review and user support", color: "#10b981", theme: "default" },
  { name: "user", displayName: "User", description: "Client user access", color: "#8b5cf6", theme: "default" },
];

const TEST_USERS = [
  { name: "Super Admin", email: "superadmin@orvanta.com", password: "SuperAdmin@123", role: "SUPER_ADMIN", isVerified: true, assignedRoleName: "super_admin" },
  { name: "Admin User", email: "admin@orvanta.com", password: "Admin@123", role: "ADMIN", isVerified: true, assignedRoleName: "admin" },
  { name: "Manager User", email: "manager@orvanta.com", password: "Manager@123", role: "ADMIN", isVerified: true, assignedRoleName: "manager" },
  { name: "Support User", email: "support@orvanta.com", password: "Support@123", role: "ADMIN", isVerified: true, assignedRoleName: "support" },
  { name: "Ritesh Kumar", email: "riteshtest@gmail.com", password: "Ritesh@123", role: "USER", isVerified: true, assignedRoleName: "user" },
  { name: "Client User", email: "client@orvanta.com", password: "Client@123", role: "USER", isVerified: true, assignedRoleName: "user" },
];

async function main() {
  console.log("=== ORVANTA Financial Database Seed ===\n");

  // 1. Seed pages
  console.log("Seeding pages...");
  for (const page of DEFAULT_PAGES) {
    await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: page });
  }
  console.log(`  ✔ ${DEFAULT_PAGES.length} pages created\n`);

  // 2. Seed roles
  console.log("Seeding roles...");
  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({ where: { name: role.name }, update: {}, create: role });
  }
  console.log(`  ✔ ${DEFAULT_ROLES.length} roles created\n`);

  // 3. Assign all pages to super_admin role
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "super_admin" },
    include: { pages: true },
  });
  const allPages = await prisma.page.findMany();
  if (superAdminRole && superAdminRole.pages.length === 0) {
    await prisma.rolePage.createMany({
      data: allPages.map((p) => ({
        roleId: superAdminRole.id,
        pageId: p.id,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      })),
    });
    console.log("  ✔ All pages assigned to Super Admin role\n");
  }

  // Assign limited pages to admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
    include: { pages: true },
  });
  if (adminRole && adminRole.pages.length === 0) {
    const adminPages = ["dashboard", "users", "reports", "news", "blog"];
    const pagesToAssign = allPages.filter((p) => adminPages.includes(p.slug));
    await prisma.rolePage.createMany({
      data: pagesToAssign.map((p) => ({
        roleId: adminRole.id,
        pageId: p.id,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
      })),
    });
    console.log(`  ✔ ${pagesToAssign.length} pages assigned to Admin role\n`);
  }

  // Assign read-only pages to analyst role
  const analystRole = await prisma.role.findUnique({
    where: { name: "analyst" },
    include: { pages: true },
  });
  if (analystRole && analystRole.pages.length === 0) {
    const analystPages = ["dashboard", "reports", "trading", "exchange"];
    const pagesToAssign = allPages.filter((p) => analystPages.includes(p.slug));
    await prisma.rolePage.createMany({
      data: pagesToAssign.map((p) => ({
        roleId: analystRole.id,
        pageId: p.id,
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      })),
    });
    console.log(`  ✔ ${pagesToAssign.length} pages assigned to Analyst role (read-only)\n`);
  }

  // Assign client pages to user role
  const userRole = await prisma.role.findUnique({
    where: { name: "user" },
    include: { pages: true },
  });
  if (userRole && userRole.pages.length === 0) {
    const userPages = ["dashboard", "wallet", "trading", "exchange", "news", "blog", "settings", "index"];
    const pagesToAssign = allPages.filter((p) => userPages.includes(p.slug));
    await prisma.rolePage.createMany({
      data: pagesToAssign.map((p) => ({
        roleId: userRole.id,
        pageId: p.id,
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      })),
    });
    console.log(`  ✔ ${pagesToAssign.length} pages assigned to User role\n`);
  }

  // 4. Ensure super_admin has ALL pages (works for existing DBs too)
  const superAdminRoleEnsured = await prisma.role.findUnique({ where: { name: "super_admin" } });
  if (superAdminRoleEnsured) {
    for (const p of allPages) {
      await prisma.rolePage.upsert({
        where: { roleId_pageId: { roleId: superAdminRoleEnsured.id, pageId: p.id } },
        update: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        create: { roleId: superAdminRoleEnsured.id, pageId: p.id, canView: true, canCreate: true, canEdit: true, canDelete: true },
      });
    }
    console.log("  ✔ Super Admin role has all pages\n");
  }

  // 5. Seed Index Tiers
  console.log("Seeding index tiers...");
  const defaultTiers = [
    { minAmount: 100, maxAmount: 500, label: "NOVA INDEX", weeklyReturn: 3.00, monthlyReturn: 5.00, halfYearlyReturn: 18 },
    { minAmount: 501, maxAmount: 2000, label: "PRIME INDEX", weeklyReturn: 5.00, monthlyReturn: 7.00, halfYearlyReturn: 18 },
    { minAmount: 2001, maxAmount: 10000, label: "VERTEX INDEX", weeklyReturn: 7.00, monthlyReturn: 9.00, halfYearlyReturn: 24 },
    { minAmount: 10001, maxAmount: 999999999, label: "IMPERIUM INDEX", weeklyReturn: 9.00, monthlyReturn: 11.00, halfYearlyReturn: 30 },
  ];
  const existingTierCount = await prisma.indexTier.count();
  if (existingTierCount === 0) {
    await prisma.indexTier.createMany({ data: defaultTiers });
    console.log(`  ✔ ${defaultTiers.length} index tiers created`);
  } else {
    console.log(`  ⚠ Index tiers already exist — skipping`);
  }

  // Seed Index Manager
  console.log("Seeding index manager...");
  const existingManager = await prisma.indexManager.findFirst();
  if (!existingManager) {
    await prisma.indexManager.create({
      data: { name: "Orla Steenbakkers", title: "Index Manager", bio: "Senior portfolio manager specializing in diversified index strategies." },
    });
    console.log("  ✔ Index manager created");
  } else {
    console.log("  ⚠ Index manager already exists — skipping");
  }

  // Seed Index Prices (sample data for chart)
  console.log("Seeding index price history...");
  const existingPriceCount = await prisma.indexPrice.count();
  if (existingPriceCount === 0) {
    const samplePrices = [
      { dateLabel: "29 Jul", price: 0.018, changePercent: 0.0, changeAmount: 0.0 },
      { dateLabel: "30 Jul", price: 0.019, changePercent: 5.56, changeAmount: 0.001 },
      { dateLabel: "31 Jul", price: 0.0185, changePercent: -2.63, changeAmount: -0.0005 },
      { dateLabel: "01 Aug", price: 0.020, changePercent: 8.11, changeAmount: 0.0015 },
      { dateLabel: "02 Aug", price: 0.021, changePercent: 5.0, changeAmount: 0.001 },
      { dateLabel: "03 Aug", price: 0.0195, changePercent: -7.14, changeAmount: -0.0015 },
      { dateLabel: "04 Aug", price: 0.02, changePercent: 2.56, changeAmount: 0.0005 },
    ];
    const now = new Date();
    await prisma.indexPrice.createMany({
      data: samplePrices.map((p, i) => ({
        ...p,
        recordedAt: new Date(now.getTime() - (samplePrices.length - 1 - i) * 86400000),
      })),
    });
    console.log(`  ✔ ${samplePrices.length} price entries created`);
  } else {
    console.log("  ⚠ Price history already exists — skipping");
  }

  // 6. Ensure support role has dashboard + kyc pages
  const supportRole = await prisma.role.findUnique({ where: { name: "support" } });
  if (supportRole) {
    const supportPages = allPages.filter((p) => ["dashboard", "kyc", "payments", "support", "users", "index"].includes(p.slug));
    for (const p of supportPages) {
      await prisma.rolePage.upsert({
        where: { roleId_pageId: { roleId: supportRole.id, pageId: p.id } },
        update: { canView: true, canEdit: true },
        create: { roleId: supportRole.id, pageId: p.id, canView: true, canCreate: false, canEdit: true, canDelete: false },
      });
    }
    console.log(`  ✔ ${supportPages.length} pages assigned to Support role (dashboard, kyc)\n`);
  }

  // 6. Create test users
  console.log("Creating test users...");
  for (const u of TEST_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 14);
      const assignedRole = await prisma.role.findUnique({
        where: { name: u.assignedRoleName || "user" },
      });
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password: hashed,
          role: u.role,
          isVerified: u.isVerified,
          isActive: true,
          assignedRoleId: assignedRole?.id || null,
        },
      });
      console.log(`  ✔ ${u.email} (${u.role}) — Password: ${u.password}`);
    } else {
      console.log(`  ⚠ ${u.email} already exists — skipping`);
    }
  }

  console.log("\n=== Seed Complete ===\n");
  console.log("TEST ACCOUNTS:");
  console.log("─────────────────────────────────────────────────");
  console.log("| Role          | Email                       | Password        |");
  console.log("|───────────────|─────────────────────────────|─────────────────|");
  for (const u of TEST_USERS) {
    const role = u.role.padEnd(13);
    const email = u.email.padEnd(27);
    const pass = u.password.padEnd(15);
    console.log(`| ${role} | ${email} | ${pass} |`);
  }
  console.log("─────────────────────────────────────────────────\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Seed failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
