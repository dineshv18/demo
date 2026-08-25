import getPrisma from "../config/db.js";
import { logActivity } from "../middleware/activityLog.js";

function mapPayment(tx) {
  return {
    id: tx.id,
    walletId: tx.walletId,
    type: tx.type,
    amount: tx.amount,
    status: tx.status,
    description: tx.description,
    screenshotUrl: tx.screenshotUrl,
    transactionId: tx.transactionId,
    upiId: tx.upiId,
    currency: tx.currency,
    processedBy: tx.processedBy,
    processedAt: tx.processedAt,
    createdAt: tx.createdAt,
    user: tx.user,
  };
}

export const getAllPayments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [txs, total, pendingDep, pendingWd, completed, rejected] = await Promise.all([
      getPrisma().transaction.findMany({
        where,
        include: { wallet: { select: { id: true, userId: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      getPrisma().transaction.count({ where }),
      getPrisma().transaction.count({ where: { type: "DEPOSIT", status: "PENDING" } }),
      getPrisma().transaction.count({ where: { type: { in: ["WITHDRAWAL", "BONUS_WITHDRAWAL"] }, status: "PENDING" } }),
      getPrisma().transaction.count({ where: { status: "COMPLETED" } }),
      getPrisma().transaction.count({ where: { status: "FAILED" } }),
    ]);

    // attach user to each
    const walletIds = txs.map((t) => t.walletId);
    const wallets = await getPrisma().wallet.findMany({
      where: { id: { in: walletIds } },
      select: { id: true, user: { select: { id: true, name: true, email: true, role: true } } },
    });
    const walletMap = new Map(wallets.map((w) => [w.id, w.user]));

    const payments = txs.map((t) => mapPayment({ ...t, user: walletMap.get(t.walletId) }));

    return res.status(200).json({
      payments,
      total,
      page: parseInt(page) || 1,
      limit: take,
      counts: {
        pendingDeposits: pendingDep,
        pendingWithdrawals: pendingWd,
        completed,
        rejected,
        total: total,
      },
    });
  } catch (error) {
    console.error("Admin get payments error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPaymentDetail = async (req, res) => {
  try {
    const tx = await getPrisma().transaction.findUnique({
      where: { id: req.params.id },
      include: { wallet: { select: { id: true, balance: true, currency: true, user: { select: { id: true, name: true, email: true, role: true } } } } },
    });
    if (!tx) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ payment: mapPayment({ ...tx, user: tx.wallet?.user }) });
  } catch (error) {
    console.error("Admin get payment detail error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const tx = await getPrisma().transaction.findUnique({
      where: { id: req.params.id },
      include: { wallet: true },
    });
    if (!tx) return res.status(404).json({ message: "Payment not found" });
    if (tx.status !== "PENDING") return res.status(400).json({ message: "Payment is not pending" });

    await getPrisma().$transaction(async (prisma) => {
      if (tx.type === "DEPOSIT") {
        // Credit the user's wallet
        await prisma.wallet.update({
          where: { id: tx.walletId },
          data: { balance: { increment: parseFloat(tx.amount) } },
        });
      } else if (tx.type === "BONUS_WITHDRAWAL") {
        // Bonus withdrawal — deduct from bonusBalance, not the main balance
        const currentBonus = parseFloat(tx.wallet.bonusBalance);
        if (currentBonus < parseFloat(tx.amount)) {
          throw new Error("User has insufficient bonus balance to process this withdrawal");
        }
        await prisma.wallet.update({
          where: { id: tx.walletId },
          data: { bonusBalance: { decrement: parseFloat(tx.amount) } },
        });
      } else {
        // Withdrawal — deduct from balance (checked at request time, re-check here)
        const currentBalance = parseFloat(tx.wallet.balance);
        if (currentBalance < parseFloat(tx.amount)) {
          throw new Error("User has insufficient balance to process this withdrawal");
        }
        await prisma.wallet.update({
          where: { id: tx.walletId },
          data: { balance: { decrement: parseFloat(tx.amount) } },
        });
      }
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: "COMPLETED",
          processedBy: req.user.id,
          processedAt: new Date(),
        },
      });
    });

    const updated = await getPrisma().transaction.findUnique({ where: { id: tx.id } });

    await logActivity({
      userId: req.user.id,
      action: tx.type === "DEPOSIT" ? "PAYMENT_APPROVED" : "WITHDRAWAL_APPROVED",
      page: "payments",
      details: { transactionId: tx.id, type: tx.type, amount: tx.amount, targetWalletId: tx.walletId },
      req,
    });

    return res.status(200).json({ message: "Payment approved and wallet updated", payment: mapPayment(updated) });
  } catch (error) {
    console.error("Approve payment error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const tx = await getPrisma().transaction.findUnique({ where: { id: req.params.id } });
    if (!tx) return res.status(404).json({ message: "Payment not found" });
    if (tx.status !== "PENDING") return res.status(400).json({ message: "Payment is not pending" });

    const updated = await getPrisma().transaction.update({
      where: { id: tx.id },
      data: {
        status: "FAILED",
        processedBy: req.user.id,
        processedAt: new Date(),
        description: tx.description ? `${tx.description} | Rejected: ${reason || "no reason provided"}` : `Rejected: ${reason || "no reason provided"}`,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: "PAYMENT_REJECTED",
      page: "payments",
      details: { transactionId: tx.id, type: tx.type, amount: tx.amount, reason: reason || "no reason provided" },
      req,
    });

    return res.status(200).json({ message: "Payment rejected", payment: mapPayment(updated) });
  } catch (error) {
    console.error("Reject payment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};