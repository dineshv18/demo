import getPrisma from "../config/db.js";
import { logActivity } from "../middleware/activityLog.js";

async function getOrCreatePlatformWallet(prisma) {
  let wallet = await prisma.platformWallet.findFirst();
  if (!wallet) {
    wallet = await prisma.platformWallet.create({ data: {} });
  }
  return wallet;
}

export const getPlatformWallet = async (req, res) => {
  try {
    const prisma = getPrisma();
    const wallet = await getOrCreatePlatformWallet(prisma);
    const pendingWithdrawal = await prisma.platformWithdrawal.findFirst({
      where: { platformWalletId: wallet.id, status: "PENDING" },
    });
    return res.status(200).json({ wallet, pendingWithdrawal });
  } catch (error) {
    console.error("Get platform wallet error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPlatformLedger = async (req, res) => {
  try {
    const prisma = getPrisma();
    const { page = 1, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const wallet = await getOrCreatePlatformWallet(prisma);

    const [entries, total] = await Promise.all([
      prisma.platformLedgerEntry.findMany({
        where: { platformWalletId: wallet.id },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.platformLedgerEntry.count({ where: { platformWalletId: wallet.id } }),
    ]);

    // Attach the investor whose Index investment generated each fee credit,
    // so the admin can see exactly who each amount came from.
    const investmentIds = [...new Set(entries.map((e) => e.indexInvestmentId).filter(Boolean))];
    const investments = investmentIds.length
      ? await prisma.indexInvestment.findMany({
          where: { id: { in: investmentIds } },
          select: { id: true, user: { select: { id: true, name: true, email: true } } },
        })
      : [];
    const investmentUserMap = new Map(investments.map((inv) => [inv.id, inv.user]));

    const mappedEntries = entries.map((e) => ({
      ...e,
      investor: e.indexInvestmentId ? investmentUserMap.get(e.indexInvestmentId) || null : null,
    }));

    return res.status(200).json({
      entries: mappedEntries,
      total,
      page: parseInt(page) || 1,
      limit: take,
      totalPages: Math.max(Math.ceil(total / take), 1),
    });
  } catch (error) {
    console.error("Get platform ledger error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requestPlatformWithdrawal = async (req, res) => {
  try {
    const prisma = getPrisma();
    const { amount, destination, note } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!destination || !destination.trim()) {
      return res.status(400).json({ message: "Destination (bank/UPI details) is required" });
    }

    const wallet = await getOrCreatePlatformWallet(prisma);
    if (parseFloat(wallet.balance) < parsedAmount) {
      return res.status(400).json({ message: "Insufficient platform balance" });
    }

    const existingPending = await prisma.platformWithdrawal.findFirst({
      where: { platformWalletId: wallet.id, status: "PENDING" },
    });
    if (existingPending) {
      return res.status(400).json({ message: "There is already a pending platform withdrawal request." });
    }

    const withdrawal = await prisma.platformWithdrawal.create({
      data: {
        platformWalletId: wallet.id,
        amount: parsedAmount,
        destination: destination.trim(),
        note: note && note.trim() ? note.trim() : null,
        requestedBy: req.user.id,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: "PLATFORM_WITHDRAWAL_REQUESTED",
      page: "platform-wallet",
      details: { withdrawalId: withdrawal.id, amount: parsedAmount },
      req,
    });

    return res.status(201).json({ message: "Withdrawal request created", withdrawal });
  } catch (error) {
    console.error("Request platform withdrawal error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPlatformWithdrawals = async (req, res) => {
  try {
    const prisma = getPrisma();
    const { status, page = 1, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const where = status ? { status } : {};

    const [withdrawals, total] = await Promise.all([
      prisma.platformWithdrawal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.platformWithdrawal.count({ where }),
    ]);

    // Attach requester/processor names for display
    const userIds = [...new Set(withdrawals.flatMap((w) => [w.requestedBy, w.processedBy].filter(Boolean)))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const mapped = withdrawals.map((w) => ({
      ...w,
      requester: userMap.get(w.requestedBy) || null,
      processor: w.processedBy ? userMap.get(w.processedBy) || null : null,
    }));

    return res.status(200).json({
      withdrawals: mapped,
      total,
      page: parseInt(page) || 1,
      limit: take,
      totalPages: Math.max(Math.ceil(total / take), 1),
    });
  } catch (error) {
    console.error("Get platform withdrawals error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const processPlatformWithdrawal = async (req, res) => {
  try {
    const prisma = getPrisma();
    const { id } = req.params;
    const { action, note } = req.body; // action: "approve" | "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const withdrawal = await prisma.platformWithdrawal.findUnique({ where: { id } });
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal request not found" });
    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({ message: "This request has already been processed" });
    }

    if (action === "approve") {
      const wallet = await prisma.platformWallet.findUnique({ where: { id: withdrawal.platformWalletId } });
      if (parseFloat(wallet.balance) < parseFloat(withdrawal.amount)) {
        return res.status(400).json({ message: "Insufficient platform balance to approve this withdrawal" });
      }
      await prisma.$transaction([
        prisma.platformWallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: parseFloat(withdrawal.amount) } },
        }),
        prisma.platformLedgerEntry.create({
          data: {
            platformWalletId: wallet.id,
            type: "WITHDRAWAL",
            amount: parseFloat(withdrawal.amount),
            description: `Withdrawal to ${withdrawal.destination}`,
          },
        }),
        prisma.platformWithdrawal.update({
          where: { id },
          data: {
            status: "COMPLETED",
            processedBy: req.user.id,
            processedAt: new Date(),
            ...(note !== undefined && { note }),
          },
        }),
      ]);
    } else {
      await prisma.platformWithdrawal.update({
        where: { id },
        data: {
          status: "REJECTED",
          processedBy: req.user.id,
          processedAt: new Date(),
          ...(note !== undefined && { note }),
        },
      });
    }

    await logActivity({
      userId: req.user.id,
      action: action === "approve" ? "PLATFORM_WITHDRAWAL_APPROVED" : "PLATFORM_WITHDRAWAL_REJECTED",
      page: "platform-wallet",
      details: { withdrawalId: id, amount: withdrawal.amount },
      req,
    });

    const updated = await prisma.platformWithdrawal.findUnique({ where: { id } });
    return res.status(200).json({ message: `Withdrawal ${action === "approve" ? "approved" : "rejected"}`, withdrawal: updated });
  } catch (error) {
    console.error("Process platform withdrawal error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
