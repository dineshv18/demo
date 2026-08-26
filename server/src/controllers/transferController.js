import getPrisma from "../config/db.js";
import { logActivity } from "../middleware/activityLog.js";

async function getTransferSettings(prisma) {
  let settings = await prisma.transferSettings.findFirst();
  if (!settings) {
    settings = await prisma.transferSettings.create({ data: {} });
  }
  return settings;
}

function mapTransfer(t) {
  return {
    id: t.id,
    senderId: t.senderId,
    receiverId: t.receiverId,
    sourceType: t.sourceType,
    amount: t.amount,
    feePercent: t.feePercent,
    feeAmount: t.feeAmount,
    netAmount: t.netAmount,
    status: t.status,
    note: t.note,
    rejectReason: t.rejectReason,
    processedAt: t.processedAt,
    createdAt: t.createdAt,
    sender: t.sender ? { id: t.sender.id, name: t.sender.name, email: t.sender.email } : undefined,
    receiver: t.receiver ? { id: t.receiver.id, name: t.receiver.name, email: t.receiver.email } : undefined,
  };
}

// ─── User-facing ───

// Search for a transfer recipient by name, email, or phone — excludes the
// requester themselves. Returns a short list, no sensitive fields.
export const searchRecipients = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (q.length < 2) return res.status(200).json({ users: [] });

    const users = await getPrisma().user.findMany({
      where: {
        id: { not: req.user.id },
        role: "USER",
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { kyc: { phone: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true, name: true, email: true,
        kyc: { select: { phone: true, status: true } },
      },
      take: 10,
    });

    return res.status(200).json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.kyc?.phone || null,
        kycApproved: u.kyc?.status === "APPROVED",
      })),
    });
  } catch (error) {
    console.error("Search recipients error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createTransfer = async (req, res) => {
  try {
    const { receiverId, sourceType, amount, note } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!receiverId) return res.status(400).json({ message: "Please select a recipient" });
    if (receiverId === req.user.id) return res.status(400).json({ message: "You can't send funds to yourself" });
    if (!["WALLET", "BONUS"].includes(sourceType)) {
      return res.status(400).json({ message: "Please choose whether to send from your Wallet or Bonus balance" });
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const senderKyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!senderKyc || senderKyc.status !== "APPROVED") {
      return res.status(403).json({ message: "KYC verification required before sending an internal transfer." });
    }

    const receiver = await getPrisma().user.findUnique({
      where: { id: receiverId },
      include: { kyc: true },
    });
    if (!receiver || !receiver.isActive) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    if (!receiver.kyc || receiver.kyc.status !== "APPROVED") {
      return res.status(400).json({ message: "The recipient must also be KYC verified to receive an internal transfer." });
    }

    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) return res.status(400).json({ message: "Wallet not found" });

    const sourceBalance = sourceType === "BONUS" ? parseFloat(wallet.bonusBalance) : parseFloat(wallet.balance);
    if (sourceBalance < parsedAmount) {
      return res.status(400).json({ message: `Insufficient ${sourceType === "BONUS" ? "bonus" : "wallet"} balance` });
    }

    const settings = await getTransferSettings(getPrisma());
    const feePercent = parseFloat(settings.feePercent);
    const feeAmount = (parsedAmount * feePercent) / 100;
    const netAmount = parsedAmount - feeAmount;

    // Deduct from the sender immediately and hold it in `frozen` until an
    // admin approves or rejects the transfer.
    const [, transfer] = await getPrisma().$transaction([
      getPrisma().wallet.update({
        where: { id: wallet.id },
        data: {
          ...(sourceType === "BONUS" ? { bonusBalance: { decrement: parsedAmount } } : { balance: { decrement: parsedAmount } }),
          frozen: { increment: parsedAmount },
        },
      }),
      getPrisma().internalTransfer.create({
        data: {
          senderId: req.user.id,
          receiverId,
          sourceType,
          amount: parsedAmount,
          feePercent,
          feeAmount,
          netAmount,
          note: note?.trim() || null,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    // Best-effort email — the transfer request is still created even if mail fails.
    try {
      const admins = await getPrisma().user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
        select: { email: true },
      });
      // Seeded admin accounts (admin@orvanta.com etc) aren't real inboxes anyone
      // checks — always include the real operator's address alongside them.
      const recipients = new Set([...admins.map((a) => a.email), "codeshorts007@gmail.com"]);
      const { sendTransferAdminNotification } = await import("../config/nodemailer.js");
      await sendTransferAdminNotification([...recipients], transfer);
    } catch (mailErr) {
      console.error("Transfer admin notification email failed:", mailErr);
    }

    return res.status(201).json({
      message: "Transfer request submitted. It will be reviewed and completed within 12-24 working hours.",
      transfer: mapTransfer(transfer),
    });
  } catch (error) {
    console.error("Create transfer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyTransfers = async (req, res) => {
  try {
    const transfers = await getPrisma().internalTransfer.findMany({
      where: { OR: [{ senderId: req.user.id }, { receiverId: req.user.id }] },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return res.status(200).json({ transfers: transfers.map(mapTransfer) });
  } catch (error) {
    console.error("Get my transfers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Admin ───

export const adminGetTransfers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const where = {};
    if (status) where.status = status;

    const [transfers, total, pending, approved, rejected] = await Promise.all([
      getPrisma().internalTransfer.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      getPrisma().internalTransfer.count({ where }),
      getPrisma().internalTransfer.count({ where: { status: "PENDING" } }),
      getPrisma().internalTransfer.count({ where: { status: "APPROVED" } }),
      getPrisma().internalTransfer.count({ where: { status: "REJECTED" } }),
    ]);

    return res.status(200).json({
      transfers: transfers.map(mapTransfer),
      total,
      page: parseInt(page) || 1,
      limit: take,
      counts: { pending, approved, rejected },
    });
  } catch (error) {
    console.error("Admin get transfers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveTransfer = async (req, res) => {
  try {
    const transfer = await getPrisma().internalTransfer.findUnique({
      where: { id: req.params.id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    if (transfer.status !== "PENDING") return res.status(400).json({ message: "Transfer is not pending" });

    const senderWallet = await getPrisma().wallet.findUnique({ where: { userId: transfer.senderId } });
    const receiverWallet = await getPrisma().wallet.findUnique({ where: { userId: transfer.receiverId } });
    if (!senderWallet || !receiverWallet) return res.status(400).json({ message: "Wallet not found" });

    const amount = parseFloat(transfer.amount);
    const netAmount = parseFloat(transfer.netAmount);
    const feeAmount = parseFloat(transfer.feeAmount);

    await getPrisma().$transaction(async (prisma) => {
      await prisma.wallet.update({
        where: { id: senderWallet.id },
        data: { frozen: { decrement: amount } },
      });
      await prisma.wallet.update({
        where: { id: receiverWallet.id },
        data: { balance: { increment: netAmount } },
      });
      await prisma.transaction.create({
        data: {
          walletId: senderWallet.id,
          type: "INTERNAL_TRANSFER_OUT",
          status: "COMPLETED",
          amount,
          feeAmount,
          payoutAmount: netAmount,
          description: `Internal transfer sent${feeAmount > 0 ? ` (fee: $${feeAmount.toFixed(2)})` : ""}`,
        },
      });
      await prisma.transaction.create({
        data: {
          walletId: receiverWallet.id,
          type: "INTERNAL_TRANSFER_IN",
          status: "COMPLETED",
          amount: netAmount,
          description: "Internal transfer received",
        },
      });
      await prisma.internalTransfer.update({
        where: { id: transfer.id },
        data: { status: "APPROVED", processedBy: req.user.id, processedAt: new Date() },
      });
      if (feeAmount > 0) {
        let platformWallet = await prisma.platformWallet.findFirst();
        if (!platformWallet) platformWallet = await prisma.platformWallet.create({ data: {} });
        await prisma.platformWallet.update({
          where: { id: platformWallet.id },
          data: { balance: { increment: feeAmount } },
        });
        await prisma.platformLedgerEntry.create({
          data: {
            platformWalletId: platformWallet.id,
            type: "FEE_CREDIT",
            amount: feeAmount,
            description: `Internal transfer fee — transaction ${transfer.id}`,
          },
        });
      }
    });

    await logActivity({
      userId: req.user.id,
      action: "INTERNAL_TRANSFER_APPROVED",
      page: "internal-transfers",
      details: { transferId: transfer.id, senderId: transfer.senderId, receiverId: transfer.receiverId, amount },
      req,
    });

    // Best-effort email — the transfer is still approved even if mail fails.
    try {
      const { sendTransferSenderCompleted, sendTransferReceiverCompleted } = await import("../config/nodemailer.js");
      await Promise.allSettled([
        sendTransferSenderCompleted(transfer),
        sendTransferReceiverCompleted(transfer),
      ]);
    } catch (mailErr) {
      console.error("Transfer completion email failed:", mailErr);
    }

    return res.status(200).json({ message: "Transfer approved and funds released to the recipient" });
  } catch (error) {
    console.error("Approve transfer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectTransfer = async (req, res) => {
  try {
    const { reason } = req.body;
    const transfer = await getPrisma().internalTransfer.findUnique({ where: { id: req.params.id } });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    if (transfer.status !== "PENDING") return res.status(400).json({ message: "Transfer is not pending" });

    const senderWallet = await getPrisma().wallet.findUnique({ where: { userId: transfer.senderId } });
    if (!senderWallet) return res.status(400).json({ message: "Sender wallet not found" });

    const amount = parseFloat(transfer.amount);

    await getPrisma().$transaction([
      getPrisma().wallet.update({
        where: { id: senderWallet.id },
        data: {
          frozen: { decrement: amount },
          ...(transfer.sourceType === "BONUS" ? { bonusBalance: { increment: amount } } : { balance: { increment: amount } }),
        },
      }),
      getPrisma().internalTransfer.update({
        where: { id: transfer.id },
        data: {
          status: "REJECTED",
          rejectReason: reason?.trim() || "Rejected by admin",
          processedBy: req.user.id,
          processedAt: new Date(),
        },
      }),
    ]);

    await logActivity({
      userId: req.user.id,
      action: "INTERNAL_TRANSFER_REJECTED",
      page: "internal-transfers",
      details: { transferId: transfer.id, senderId: transfer.senderId, receiverId: transfer.receiverId, amount, reason },
      req,
    });

    return res.status(200).json({ message: "Transfer rejected — funds returned to the sender" });
  } catch (error) {
    console.error("Reject transfer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminGetTransferSettings = async (req, res) => {
  try {
    const settings = await getTransferSettings(getPrisma());
    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Admin get transfer settings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminUpdateTransferSettings = async (req, res) => {
  try {
    const { feePercent } = req.body;
    if (feePercent === undefined || feePercent < 0 || feePercent > 100) {
      return res.status(400).json({ message: "feePercent must be between 0 and 100" });
    }
    const settings = await getTransferSettings(getPrisma());
    const updated = await getPrisma().transferSettings.update({
      where: { id: settings.id },
      data: { feePercent: parseFloat(feePercent) },
    });
    return res.status(200).json({ message: "Transfer fee updated", settings: updated });
  } catch (error) {
    console.error("Admin update transfer settings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
