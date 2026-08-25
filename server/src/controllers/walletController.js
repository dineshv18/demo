import getPrisma from "../config/db.js";

export async function getWalletSettings(prisma) {
  let settings = await prisma.walletSettings.findFirst();
  if (!settings) {
    settings = await prisma.walletSettings.create({ data: {} });
  }
  return settings;
}

export async function creditPlatformWalletFromFee(prisma, amount, description) {
  if (amount <= 0) return;
  let platformWallet = await prisma.platformWallet.findFirst();
  if (!platformWallet) platformWallet = await prisma.platformWallet.create({ data: {} });
  await prisma.platformWallet.update({
    where: { id: platformWallet.id },
    data: { balance: { increment: amount } },
  });
  await prisma.platformLedgerEntry.create({
    data: { platformWalletId: platformWallet.id, type: "FEE_CREDIT", amount, description },
  });
}

export const getWallet = async (req, res) => {
  try {
    let wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await getPrisma().wallet.create({ data: { userId: req.user.id } });
    }

    const txCount = await getPrisma().transaction.count({ where: { walletId: wallet.id } });
    const currencyLocked = txCount > 0;

    const env = (await import("../config/env.js")).default();
    const walletSettings = await getWalletSettings(getPrisma());
    return res.status(200).json({
      wallet,
      upiId: env.ORVANTA_UPI_ID,
      usdPayment: {
        method: env.ORVANTA_USD_PAYMENT_METHOD,
        accountName: env.ORVANTA_USD_ACCOUNT_NAME,
        accountNumber: env.ORVANTA_USD_ACCOUNT_NUMBER,
        routingNumber: env.ORVANTA_USD_ROUTING_NUMBER,
        swiftCode: env.ORVANTA_USD_SWIFT_CODE,
        bankName: env.ORVANTA_USD_BANK_NAME,
      },
      pendingRequest: await getPendingRequest(req.user.id, ["DEPOSIT", "WITHDRAWAL"]),
      pendingBonusRequest: await getPendingRequest(req.user.id, ["BONUS_WITHDRAWAL"]),
      currencyLocked,
      withdrawalSettings: {
        minWithdrawal: parseFloat(walletSettings.minWithdrawal),
        feeAmount: parseFloat(walletSettings.withdrawalFeeAmount),
      },
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

async function getPendingRequest(userId, types) {
  const wallet = await getPrisma().wallet.findUnique({ where: { userId } });
  if (!wallet) return null;
  const pending = await getPrisma().transaction.findFirst({
    where: { walletId: wallet.id, status: "PENDING", type: { in: types } },
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

const BONUS_TYPES = ["BONUS_CREDIT", "BONUS_WITHDRAWAL", "BONUS_TRANSFER"];

function mapWalletTx(tx) {
  return {
    id: `wallet-${tx.id}`,
    category: BONUS_TYPES.includes(tx.type) ? "BONUS" : "WALLET",
    type: tx.type, // DEPOSIT | WITHDRAWAL | BONUS_CREDIT | BONUS_WITHDRAWAL | BONUS_TRANSFER
    amount: parseFloat(tx.amount),
    status: tx.status, // PENDING | COMPLETED | FAILED | CANCELLED
    description: tx.description,
    date: tx.createdAt,
  };
}

function mapIndexEvents(inv) {
  const out = [
    {
      id: `index-invest-${inv.id}`,
      category: "INDEX",
      type: "INDEX_INVEST",
      amount: parseFloat(inv.amount),
      grossAmount: parseFloat(inv.amount),
      feeAmount: parseFloat(inv.feeAmount || 0),
      netAmount: parseFloat(inv.netAmount || inv.amount),
      status: "COMPLETED",
      description: `Invested in ${inv.tier.label}`,
      date: inv.activatedAt,
    },
  ];
  if (inv.withdrawnAt) {
    const grossAmount = parseFloat(inv.netAmount || inv.amount);
    const feeAmount = inv.withdrawalFee !== null ? parseFloat(inv.withdrawalFee) : 0;
    out.push({
      id: `index-withdraw-${inv.id}`,
      category: "INDEX",
      type: "INDEX_WITHDRAW",
      amount: inv.payoutAmount !== null ? parseFloat(inv.payoutAmount) : null,
      grossAmount,
      feeAmount,
      netAmount: inv.payoutAmount !== null ? parseFloat(inv.payoutAmount) : null,
      status: inv.status === "MATURED" ? "COMPLETED" : "CANCELLED",
      description: inv.status === "MATURED"
        ? `Index investment matured — ${inv.tier.label}`
        : `Index investment withdrawn early — ${inv.tier.label}`,
      date: inv.withdrawnAt,
    });
  }
  return out;
}

// Unified, filterable, paginated activity feed — merges wallet deposits/
// withdrawals with Index investment activations and payouts into one
// timeline. Two tables can't be UNIONed by Prisma: for the "ALL" view we
// page each source by the same window and merge+slice in memory (window
// capped well above any page size so the merge never drops an entry); a
// single-type filter skips the merge entirely and paginates that table
// directly, so filtered pagination is always exact.
export const getMyTransactionHistory = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const type = req.query.type; // DEPOSIT | WITHDRAWAL | INDEX | BONUS | undefined(=ALL)

    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });

    if (type === "DEPOSIT" || type === "WITHDRAWAL" || type === "BONUS") {
      if (!wallet) {
        return res.status(200).json({ transactions: [], page, limit, total: 0, totalPages: 1 });
      }
      const where = type === "BONUS"
        ? { walletId: wallet.id, type: { in: BONUS_TYPES } }
        : { walletId: wallet.id, type };
      const [txs, total] = await Promise.all([
        getPrisma().transaction.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        getPrisma().transaction.count({ where }),
      ]);
      return res.status(200).json({
        transactions: txs.map(mapWalletTx),
        page, limit, total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      });
    }

    if (type === "INDEX") {
      // Index events are a variable 1-or-2-per-row expansion (invest, +withdraw),
      // so we can't paginate the DB query directly — fetch the user's full set,
      // expand, sort, and slice. Bounded by one user's investment count, which
      // is inherently small (one active investment at a time).
      const investments = await getPrisma().indexInvestment.findMany({
        where: { userId: req.user.id },
        include: { tier: true },
        orderBy: { createdAt: "desc" },
      });
      const events = investments.flatMap(mapIndexEvents);
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const total = events.length;
      const start = (page - 1) * limit;
      return res.status(200).json({
        transactions: events.slice(start, start + limit),
        page, limit, total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      });
    }

    // ALL — merge both sources
    const windowSize = page * limit;

    const [walletTxs, investments, walletTotal, investmentTotal, withdrawnCount] = await Promise.all([
      wallet
        ? getPrisma().transaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: "desc" },
            take: windowSize,
          })
        : Promise.resolve([]),
      getPrisma().indexInvestment.findMany({
        where: { userId: req.user.id },
        include: { tier: true },
        orderBy: { createdAt: "desc" },
        take: windowSize,
      }),
      wallet ? getPrisma().transaction.count({ where: { walletId: wallet.id } }) : Promise.resolve(0),
      getPrisma().indexInvestment.count({ where: { userId: req.user.id } }),
      getPrisma().indexInvestment.count({ where: { userId: req.user.id, withdrawnAt: { not: null } } }),
    ]);

    const events = [
      ...walletTxs.map(mapWalletTx),
      ...investments.flatMap(mapIndexEvents),
    ];
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const start = (page - 1) * limit;
    const pageEvents = events.slice(start, start + limit);
    const total = walletTotal + investmentTotal + withdrawnCount;

    return res.status(200).json({
      transactions: pageEvents,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
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
    const settings = await getWalletSettings(getPrisma());
    const minWithdrawal = parseFloat(settings.minWithdrawal);
    const feeAmount = parseFloat(settings.withdrawalFeeAmount);

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (amount < minWithdrawal) return res.status(400).json({ message: `Minimum withdrawal is $${minWithdrawal.toFixed(2)}` });
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

    const payoutAmount = Math.max(parseFloat(amount) - feeAmount, 0);

    const transaction = await getPrisma().transaction.create({
      data: {
        walletId: wallet.id,
        type: "WITHDRAWAL",
        amount: parseFloat(amount),
        feeAmount,
        payoutAmount,
        status: "PENDING",
        description: `Withdrawal request of ${wallet.currency} ${amount} (a $${feeAmount.toFixed(2)} processing fee applies)`,
        upiId: upiId.trim(),
        currency: wallet.currency,
      },
    });

    return res.status(201).json({
      message: `Withdrawal request submitted. A $${feeAmount.toFixed(2)} processing fee applies — you'll receive $${payoutAmount.toFixed(2)} on your UPI within 12-24 working hours.`,
      transaction,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Move Bonus balance into the main wallet balance — the user's own referral
// earnings, so this is instant and needs no admin approval (unlike a real
// withdrawal, which pays out to an external UPI account).
export const transferBonusToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet || parseFloat(wallet.bonusBalance) < parsedAmount) {
      return res.status(400).json({ message: "Insufficient bonus balance" });
    }

    const [, transaction] = await getPrisma().$transaction([
      getPrisma().wallet.update({
        where: { id: wallet.id },
        data: {
          bonusBalance: { decrement: parsedAmount },
          balance: { increment: parsedAmount },
        },
      }),
      getPrisma().transaction.create({
        data: {
          walletId: wallet.id,
          type: "BONUS_TRANSFER",
          status: "COMPLETED",
          amount: parsedAmount,
          description: "Bonus transferred to wallet balance",
        },
      }),
    ]);

    return res.status(200).json({ message: "Bonus added to your wallet balance.", transaction });
  } catch (error) {
    console.error("Bonus transfer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Withdraw straight from Bonus to an external UPI account — same
// admin-approval flow as a regular wallet withdrawal, just against
// bonusBalance instead of balance. Balance is deducted at approval time.
export const requestBonusWithdrawal = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const settings = await getWalletSettings(getPrisma());
    const minWithdrawal = parseFloat(settings.minWithdrawal);
    const feeAmount = parseFloat(settings.withdrawalFeeAmount);

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (amount < minWithdrawal) return res.status(400).json({ message: `Minimum withdrawal is $${minWithdrawal.toFixed(2)}` });
    if (!upiId || !upiId.trim()) return res.status(400).json({ message: "Your UPI ID is required to receive the withdrawal" });

    const kyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!kyc || kyc.status !== "APPROVED") {
      return res.status(403).json({ message: "KYC verification required before withdrawals. Please complete your KYC verification first." });
    }

    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet || parseFloat(wallet.bonusBalance) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient bonus balance" });
    }

    const existingPending = await getPrisma().transaction.findFirst({
      where: { walletId: wallet.id, status: "PENDING", type: "BONUS_WITHDRAWAL" },
    });
    if (existingPending) {
      return res.status(400).json({ message: "You already have a bonus withdrawal request under review. Please wait until it is processed." });
    }

    const payoutAmount = Math.max(parseFloat(amount) - feeAmount, 0);

    const transaction = await getPrisma().transaction.create({
      data: {
        walletId: wallet.id,
        type: "BONUS_WITHDRAWAL",
        amount: parseFloat(amount),
        feeAmount,
        payoutAmount,
        status: "PENDING",
        description: `Bonus withdrawal request of ${wallet.currency} ${amount} (a $${feeAmount.toFixed(2)} processing fee applies)`,
        upiId: upiId.trim(),
        currency: wallet.currency,
      },
    });

    return res.status(201).json({
      message: `Bonus withdrawal request submitted. A $${feeAmount.toFixed(2)} processing fee applies — you'll receive $${payoutAmount.toFixed(2)} on your UPI within 12-24 working hours.`,
      transaction,
    });
  } catch (error) {
    console.error("Bonus withdrawal error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};