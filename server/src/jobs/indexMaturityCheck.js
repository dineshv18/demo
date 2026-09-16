import getPrisma from "../config/db.js";

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours

/**
 * Finds ACTIVE investments that have crossed their maturesAt date and have
 * not been emailed about it yet, and notifies both the investor and admin.
 * Does not change investment status — maturity is still only finalized when
 * the user actually withdraws (withdrawInvestment); this is purely a
 * "your plan is ready" notification so nobody has to keep checking manually.
 */
async function checkMaturedInvestments() {
  const prisma = getPrisma();
  try {
    const matured = await prisma.indexInvestment.findMany({
      where: {
        status: "ACTIVE",
        maturesAt: { lte: new Date() },
        maturityNotifiedAt: null,
      },
      include: { tier: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (matured.length === 0) return;

    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
      select: { email: true },
    });
    const adminRecipients = [...new Set([...admins.map((a) => a.email), "codeshorts007@gmail.com"])];

    const { sendIndexMaturedUserEmail, sendIndexMaturedAdminEmail } = await import("../config/nodemailer.js");

    for (const investment of matured) {
      try {
        await Promise.all([
          sendIndexMaturedUserEmail(investment.user, investment),
          sendIndexMaturedAdminEmail(adminRecipients, investment.user, investment),
        ]);
        await prisma.indexInvestment.update({
          where: { id: investment.id },
          data: { maturityNotifiedAt: new Date() },
        });
      } catch (err) {
        console.error(`Maturity notification failed for investment ${investment.id}:`, err);
      }
    }

    console.log(`Index maturity check: notified ${matured.length} matured investment(s).`);
  } catch (err) {
    console.error("Index maturity check failed:", err);
  }
}

export function startIndexMaturityCheck() {
  checkMaturedInvestments();
  setInterval(checkMaturedInvestments, CHECK_INTERVAL_MS);
}
