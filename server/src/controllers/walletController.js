import getPrisma from "../config/db.js";

export const getWallet = async (req, res) => {
  try {
    let wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await getPrisma().wallet.create({ data: { userId: req.user.id } });
    }

    const txCount = await getPrisma().transaction.count({ where: { walletId: wallet.id } });
    const currencyLocked = txCount > 0;

    const env = (await import("../config/env.js")).default();
    return res.status(200).json({
      wallet,
      upiId: env.OVANTRA_UPI_ID,
      usdPayment: {
        method: env.OVANTRA_USD_PAYMENT_METHOD,
        accountName: env.OVANTRA_USD_ACCOUNT_NAME,
        accountNumber: env.OVANTRA_USD_ACCOUNT_NUMBER,
        routingNumber: env.OVANTRA_USD_ROUTING_NUMBER,
        swiftCode: env.OVANTRA_USD_SWIFT_CODE,
        bankName: env.OVANTRA_USD_BANK_NAME,
      },
      pendingRequest: await getPendingRequest(req.user.id),
      currencyLocked,
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const setCurrency = async (req, res) => {
  try {
    let wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await getPrisma().wallet.create({ data: { userId: req.user.id, currency: "USD" } });
      return res.status(200).json({ message: "Currency set to USD", wallet });
    }

    wallet = await getPrisma().wallet.update({ where: { id: wallet.id }, data: { currency: "USD" } });
    return res.status(200).json({ message: "Currency set to USD", wallet });
  } catch (error) {
    console.error("Set currency error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

async function getPendingRequest(userId) {
  const wallet = await getPrisma().wallet.findUnique({ where: { userId } });
  if (!wallet) return null;
  const pending = await getPrisma().transaction.findFirst({
    where: { walletId: wallet.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  return pending || null;
}

export const getTransactions = async (req, res) => {
  try {
    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) return res.status(200).json({ transactions: [] });
    const transactions = await getPrisma().transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requestDeposit = async (req, res) => {
  try {
    const { amount, transactionId } = req.body;
    const file = req.file;

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (amount < 10) return res.status(400).json({ message: "Minimum deposit is $10" });

    const kyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!kyc || kyc.status !== "APPROVED") {
      return res.status(403).json({ message: "KYC verification required before making deposits. Please complete your KYC verification first." });
    }

    if (!file) return res.status(400).json({ message: "Payment screenshot is required" });
    if (file.size > 5 * 1024 * 1024) return res.status(400).json({ message: "Screenshot must be under 5MB" });
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) return res.status(400).json({ message: "Screenshot must be JPEG, PNG, or WebP" });

    if (!transactionId || !transactionId.trim()) return res.status(400).json({ message: "Transaction ID / UTR is required" });

    let wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) wallet = await getPrisma().wallet.create({ data: { userId: req.user.id } });

    // Block duplicate pending request — user can't pay again until resolved
    const existingPending = await getPrisma().transaction.findFirst({
      where: { walletId: wallet.id, status: "PENDING", type: "DEPOSIT" },
    });
    if (existingPending) {
      return res.status(400).json({ message: "You already have a deposit request under review. Please wait until it is processed." });
    }

    const { uploadToR2 } = await import("../config/r2.js");
    const doc = await uploadToR2(file, "payment-screenshots");

    const transaction = await getPrisma().transaction.create({
      data: {
        walletId: wallet.id,
        type: "DEPOSIT",
        amount: parseFloat(amount),
        status: "PENDING",
        description: `Deposit request of ${wallet.currency} ${amount}`,
        screenshotUrl: doc.url,
        transactionId: transactionId.trim(),
        currency: wallet.currency,
      },
    });

    return res.status(201).json({ message: "Deposit request submitted. Your payment is under processing.", transaction });
  } catch (error) {
    console.error("Deposit error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, upiId } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (amount < 10) return res.status(400).json({ message: "Minimum withdrawal is $10" });
    if (!upiId || !upiId.trim()) return res.status(400).json({ message: "Your UPI ID is required to receive the withdrawal" });

    const kyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!kyc || kyc.status !== "APPROVED") {
      return res.status(403).json({ message: "KYC verification required before withdrawals. Please complete your KYC verification first." });
    }

    let wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) wallet = await getPrisma().wallet.create({ data: { userId: req.user.id } });

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Block duplicate pending withdrawal
    const existingPending = await getPrisma().transaction.findFirst({
      where: { walletId: wallet.id, status: "PENDING", type: "WITHDRAWAL" },
    });
    if (existingPending) {
      return res.status(400).json({ message: "You already have a withdrawal request under review. Please wait until it is processed." });
    }

    const transaction = await getPrisma().transaction.create({
      data: {
        walletId: wallet.id,
        type: "WITHDRAWAL",
        amount: parseFloat(amount),
        status: "PENDING",
        description: `Withdrawal request of ${wallet.currency} ${amount}`,
        upiId: upiId.trim(),
        currency: wallet.currency,
      },
    });

    return res.status(201).json({ message: "Withdrawal request submitted. You'll receive funds on your UPI within 12-24 working hours.", transaction });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};