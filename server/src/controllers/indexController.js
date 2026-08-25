import getPrisma from "../config/db.js";

async function getIndexSettings(prisma) {
  let settings = await prisma.indexSettings.findFirst();
  if (!settings) {
    settings = await prisma.indexSettings.create({ data: {} });
  }
  return settings;
}

async function getPlatformWallet(prisma) {
  let wallet = await prisma.platformWallet.findFirst();
  if (!wallet) {
    wallet = await prisma.platformWallet.create({ data: {} });
  }
  return wallet;
}

async function creditPlatformWallet(prisma, amount, description, investmentId) {
  if (amount <= 0) return;
  const platformWallet = await getPlatformWallet(prisma);
  await prisma.platformWallet.update({
    where: { id: platformWallet.id },
    data: { balance: { increment: amount } },
  });
  await prisma.platformLedgerEntry.create({
    data: {
      platformWalletId: platformWallet.id,
      type: "FEE_CREDIT",
      amount,
      description,
      indexInvestmentId: investmentId,
    },
  });
}

// Walks the referral chain up to 5 levels from the investor and pays each
// ancestor their configured cut of the maintenance fee. Whatever the fee
// doesn't cover — a chain shorter than 5, or no referrer at all — is
// credited to the platform wallet instead of silently disappearing.
async function distributeIndexCommission(prisma, investment, feeAmount) {
  const settings = await getIndexSettings(prisma);
  const levelPercents = [
    parseFloat(settings.level1Percent),
    parseFloat(settings.level2Percent),
    parseFloat(settings.level3Percent),
    parseFloat(settings.level4Percent),
    parseFloat(settings.level5Percent),
  ];

  let distributedAmount = 0;
  let currentUserId = investment.userId;
  let level = 1;
  for (; level <= 5; level++) {
    const referral = await prisma.referral.findUnique({ where: { referredId: currentUserId } });
    if (!referral) break;

    // Only the investor's direct (level 1) referral relationship reflects
    // "this person has invested" — mark it once, on their first Index investment.
    if (level === 1 && referral.status !== "DEPOSITED" && referral.status !== "COMMISSION_PAID") {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: "COMMISSION_PAID", depositedAt: new Date() },
      });
    }

    const percent = levelPercents[level - 1];
    const commissionAmount = (feeAmount * percent) / 100;

    if (commissionAmount > 0) {
      const referrerWallet = await prisma.wallet.findUnique({ where: { userId: referral.referrerId } });
      if (referrerWallet) {
        await prisma.wallet.update({
          where: { id: referrerWallet.id },
          data: { bonusBalance: { increment: commissionAmount } },
        });
        await prisma.transaction.create({
          data: {
            walletId: referrerWallet.id,
            type: "BONUS_CREDIT",
            status: "COMPLETED",
            amount: commissionAmount,
            description: `Referral commission (Level ${level}) from Index investment`,
          },
        });
        await prisma.referralCommission.create({
          data: {
            referralId: referral.id,
            userId: referral.referrerId,
            amount: commissionAmount,
            percentage: percent,
            status: "PAID",
            source: "INDEX_INVESTMENT",
            level,
            indexInvestmentId: investment.id,
          },
        });
        distributedAmount += commissionAmount;
      }
    }

    currentUserId = referral.referrerId;
  }

  const leftover = feeAmount - distributedAmount;
  if (leftover > 0) {
    await creditPlatformWallet(
      prisma,
      leftover,
      level === 1
        ? "Maintenance fee — investor has no referrer"
        : `Maintenance fee — referral chain ended at level ${level - 1}`,
      investment.id
    );
  }
}

// ─── User-facing ───

export const getIndexData = async (req, res) => {
  try {
    const prisma = getPrisma();

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    const balance = wallet ? parseFloat(wallet.balance) : 0;

    const tiers = await prisma.indexTier.findMany({
      where: { isActive: true },
      orderBy: { minAmount: "asc" },
    });

    const matchedTier = tiers.find(
      (t) => balance >= parseFloat(t.minAmount) && balance <= parseFloat(t.maxAmount)
    );
    const highestTier = tiers.length > 0 ? tiers[tiers.length - 1] : null;
    const activeTier = matchedTier || (balance > 0 && highestTier ? highestTier : null);

    const prices = await prisma.indexPrice.findMany({
      orderBy: { recordedAt: "desc" },
      take: 30,
    });

    const latestPrice = prices.length > 0 ? prices[0] : null;

    const manager = await prisma.indexManager.findFirst({
      where: { isActive: true },
    });

    const settings = await getIndexSettings(prisma);

    return res.status(200).json({
      tiers,
      activeTier,
      walletBalance: balance,
      maintenanceFeePercent: parseFloat(settings.maintenanceFeePercent),
      earlyWithdrawalPercent: parseFloat(settings.earlyWithdrawalPercent),
      maturityWithdrawalFee: parseFloat(settings.maturityWithdrawalFee),
      referralLevels: [
        parseFloat(settings.level1Percent),
        parseFloat(settings.level2Percent),
        parseFloat(settings.level3Percent),
        parseFloat(settings.level4Percent),
        parseFloat(settings.level5Percent),
      ],
      priceHistory: prices.reverse().map((p) => ({
        price: parseFloat(p.price),
        changePercent: parseFloat(p.changePercent),
        changeAmount: parseFloat(p.changeAmount),
        dateLabel: p.dateLabel || new Date(p.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        recordedAt: p.recordedAt,
      })),
      currentPrice: latestPrice
        ? {
            price: parseFloat(latestPrice.price),
            changePercent: parseFloat(latestPrice.changePercent),
            changeAmount: parseFloat(latestPrice.changeAmount),
          }
        : { price: 0, changePercent: 0, changeAmount: 0 },
      manager: manager
        ? { name: manager.name, title: manager.title, bio: manager.bio, imageUrl: manager.imageUrl }
        : null,
    });
  } catch (error) {
    console.error("Get index data error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const investInIndex = async (req, res) => {
  try {
    const { amount, tierId } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!tierId) {
      return res.status(400).json({ message: "Please select an investment tier" });
    }

    const kyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!kyc || kyc.status !== "APPROVED") {
      return res.status(403).json({ message: "KYC verification required before investing. Please complete your KYC verification first." });
    }

    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet || parseFloat(wallet.balance) < parsedAmount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const tier = await getPrisma().indexTier.findUnique({ where: { id: tierId } });
    if (!tier || !tier.isActive) {
      return res.status(400).json({ message: "Selected tier is not available" });
    }
    if (parsedAmount < parseFloat(tier.minAmount) || parsedAmount > parseFloat(tier.maxAmount)) {
      return res.status(400).json({ message: `Amount must be between $${tier.minAmount} and $${tier.maxAmount} for this tier` });
    }

    const feePercent = parseFloat(tier.maintenanceFeePercent);
    const feeAmount = (parsedAmount * feePercent) / 100;
    const netAmount = parsedAmount - feeAmount;

    const activatedAt = new Date();
    const maturesAt = new Date(activatedAt);
    maturesAt.setMonth(maturesAt.getMonth() + tier.durationMonths);

    const [, investment] = await getPrisma().$transaction([
      getPrisma().wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: parsedAmount } },
      }),
      getPrisma().indexInvestment.create({
        data: {
          userId: req.user.id,
          tierId: tier.id,
          amount: parsedAmount,
          feeAmount,
          netAmount,
          status: "ACTIVE",
          activatedAt,
          maturesAt,
        },
        include: { tier: true },
      }),
    ]);

    await distributeIndexCommission(getPrisma(), investment, feeAmount);

    return res.status(201).json({
      message: `Investment activated successfully. A ${feePercent}% maintenance fee ($${feeAmount.toFixed(2)}) was applied.`,
      investment,
    });
  } catch (error) {
    console.error("Invest in index error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Add funds to the user's existing active investment — same tier, same
// maturity date. The tier is locked at first investment (investInIndex
// blocks a second investInIndex call while one is ACTIVE); this is the only
// way to grow it afterwards. The added amount goes through the identical
// fee-cut + referral-commission pipeline as a fresh investment. A user can
// hold several ACTIVE investments at once (one per tier they've entered),
// so the target is identified explicitly by investmentId rather than
// assumed to be "the" active one.
export const topUpInvestment = async (req, res) => {
  try {
    const { amount, investmentId } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!investmentId) {
      return res.status(400).json({ message: "Please specify which investment to add funds to" });
    }

    const kyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!kyc || kyc.status !== "APPROVED") {
      return res.status(403).json({ message: "KYC verification required before investing. Please complete your KYC verification first." });
    }

    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet || parseFloat(wallet.balance) < parsedAmount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const existingActive = await getPrisma().indexInvestment.findFirst({
      where: { id: investmentId, userId: req.user.id, status: "ACTIVE" },
      include: { tier: true },
    });
    if (!existingActive) {
      return res.status(400).json({ message: "Active investment not found" });
    }

    const newTotal = parseFloat(existingActive.amount) + parsedAmount;
    if (newTotal > parseFloat(existingActive.tier.maxAmount)) {
      return res.status(400).json({ message: `Adding this amount would exceed the ${existingActive.tier.label} tier maximum of $${existingActive.tier.maxAmount}` });
    }

    const feePercent = parseFloat(existingActive.tier.maintenanceFeePercent);
    const feeAmount = (parsedAmount * feePercent) / 100;
    const netAmount = parsedAmount - feeAmount;

    const [, investment] = await getPrisma().$transaction([
      getPrisma().wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: parsedAmount } },
      }),
      getPrisma().indexInvestment.update({
        where: { id: existingActive.id },
        data: {
          amount: { increment: parsedAmount },
          feeAmount: { increment: feeAmount },
          netAmount: { increment: netAmount },
        },
        include: { tier: true },
      }),
    ]);

    await distributeIndexCommission(getPrisma(), investment, feeAmount);

    return res.status(200).json({
      message: `$${parsedAmount.toFixed(2)} added to your investment. A ${feePercent}% maintenance fee ($${feeAmount.toFixed(2)}) was applied.`,
      investment,
    });
  } catch (error) {
    console.error("Top up investment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const withdrawInvestment = async (req, res) => {
  try {
    const { investmentId } = req.body;
    if (!investmentId) {
      return res.status(400).json({ message: "Please specify which investment to withdraw" });
    }

    const investment = await getPrisma().indexInvestment.findFirst({
      where: { id: investmentId, userId: req.user.id, status: "ACTIVE" },
      include: { tier: true },
    });
    if (!investment) {
      return res.status(400).json({ message: "Active investment not found" });
    }

    const isMature = investment.maturesAt && new Date() >= investment.maturesAt;
    const netAmount = parseFloat(investment.netAmount);
    const exitFeePercent = isMature
      ? parseFloat(investment.tier.exitFeePercent)
      : parseFloat(investment.tier.earlyExitFeePercent);

    const withdrawalFee = (netAmount * exitFeePercent) / 100;
    const payoutAmount = Math.max(netAmount - withdrawalFee, 0);

    const wallet = await getPrisma().wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) return res.status(400).json({ message: "Wallet not found" });

    await getPrisma().$transaction([
      getPrisma().wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: payoutAmount } },
      }),
      getPrisma().indexInvestment.update({
        where: { id: investment.id },
        data: {
          status: isMature ? "MATURED" : "CANCELLED",
          withdrawnAt: new Date(),
          withdrawalFee,
          payoutAmount,
        },
      }),
    ]);

    // Withdrawal fee (early-exit % or maturity-exit %) goes entirely to the
    // platform — unlike the invest-time maintenance fee, it is never split
    // across the referral chain.
    await creditPlatformWallet(
      getPrisma(),
      withdrawalFee,
      isMature
        ? `Maturity exit fee (${exitFeePercent.toFixed(2)}%) — ${investment.tier.label}`
        : `Early exit fee (${exitFeePercent.toFixed(2)}%) — ${investment.tier.label}`,
      investment.id
    );

    return res.status(200).json({
      message: isMature
        ? `Investment matured and withdrawn. A ${exitFeePercent.toFixed(2)}% exit fee ($${withdrawalFee.toFixed(2)}) was applied.`
        : `Investment withdrawn early. A ${exitFeePercent.toFixed(2)}% early-exit fee ($${withdrawalFee.toFixed(2)}) was applied.`,
      payoutAmount,
      withdrawalFee,
      wasMature: isMature,
    });
  } catch (error) {
    console.error("Withdraw investment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyInvestments = async (req, res) => {
  try {
    const investments = await getPrisma().indexInvestment.findMany({
      where: { userId: req.user.id },
      include: { tier: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ investments });
  } catch (error) {
    console.error("Get my investments error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Admin ───

export const adminGetTiers = async (req, res) => {
  try {
    const tiers = await getPrisma().indexTier.findMany({ orderBy: { minAmount: "asc" } });
    return res.status(200).json({ tiers });
  } catch (error) {
    console.error("Admin get tiers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminCreateTier = async (req, res) => {
  try {
    const {
      minAmount, maxAmount, label, tagline, durationMonths,
      weeklyReturn, monthlyReturn, halfYearlyReturn,
      maintenanceFeePercent, exitFeePercent, earlyExitFeePercent,
    } = req.body;
    if (!minAmount || !maxAmount || !label) {
      return res.status(400).json({ message: "minAmount, maxAmount, and label are required" });
    }

    const tier = await getPrisma().indexTier.create({
      data: {
        minAmount: parseFloat(minAmount),
        maxAmount: parseFloat(maxAmount),
        label,
        tagline: tagline || null,
        durationMonths: parseInt(durationMonths || 18),
        weeklyReturn: parseFloat(weeklyReturn || 0),
        monthlyReturn: parseFloat(monthlyReturn || 0),
        halfYearlyReturn: parseFloat(halfYearlyReturn || 0),
        maintenanceFeePercent: parseFloat(maintenanceFeePercent ?? 5),
        exitFeePercent: parseFloat(exitFeePercent ?? 2),
        earlyExitFeePercent: parseFloat(earlyExitFeePercent ?? 17),
      },
    });

    return res.status(201).json({ message: "Tier created", tier });
  } catch (error) {
    console.error("Admin create tier error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminUpdateTier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      minAmount, maxAmount, label, tagline, durationMonths,
      weeklyReturn, monthlyReturn, halfYearlyReturn, isActive,
      maintenanceFeePercent, exitFeePercent, earlyExitFeePercent,
    } = req.body;

    const existing = await getPrisma().indexTier.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Tier not found" });

    const tier = await getPrisma().indexTier.update({
      where: { id },
      data: {
        ...(minAmount !== undefined && { minAmount: parseFloat(minAmount) }),
        ...(maxAmount !== undefined && { maxAmount: parseFloat(maxAmount) }),
        ...(label !== undefined && { label }),
        ...(tagline !== undefined && { tagline: tagline || null }),
        ...(durationMonths !== undefined && { durationMonths: parseInt(durationMonths) }),
        ...(weeklyReturn !== undefined && { weeklyReturn: parseFloat(weeklyReturn) }),
        ...(monthlyReturn !== undefined && { monthlyReturn: parseFloat(monthlyReturn) }),
        ...(halfYearlyReturn !== undefined && { halfYearlyReturn: parseFloat(halfYearlyReturn) }),
        ...(maintenanceFeePercent !== undefined && { maintenanceFeePercent: parseFloat(maintenanceFeePercent) }),
        ...(exitFeePercent !== undefined && { exitFeePercent: parseFloat(exitFeePercent) }),
        ...(earlyExitFeePercent !== undefined && { earlyExitFeePercent: parseFloat(earlyExitFeePercent) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.status(200).json({ message: "Tier updated", tier });
  } catch (error) {
    console.error("Admin update tier error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminDeleteTier = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getPrisma().indexTier.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Tier not found" });

    await getPrisma().indexTier.delete({ where: { id } });
    return res.status(200).json({ message: "Tier deleted" });
  } catch (error) {
    console.error("Admin delete tier error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Price History
export const adminGetPrices = async (req, res) => {
  try {
    const prices = await getPrisma().indexPrice.findMany({
      orderBy: { recordedAt: "desc" },
      take: 100,
    });
    return res.status(200).json({ prices });
  } catch (error) {
    console.error("Admin get prices error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminCreatePrice = async (req, res) => {
  try {
    const { price, changePercent, changeAmount, dateLabel, recordedAt } = req.body;
    if (price === undefined) return res.status(400).json({ message: "price is required" });

    const entry = await getPrisma().indexPrice.create({
      data: {
        price: parseFloat(price),
        changePercent: parseFloat(changePercent || 0),
        changeAmount: parseFloat(changeAmount || 0),
        dateLabel: dateLabel || null,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    });

    return res.status(201).json({ message: "Price entry created", price: entry });
  } catch (error) {
    console.error("Admin create price error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminUpdatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, changePercent, changeAmount, dateLabel } = req.body;

    const existing = await getPrisma().indexPrice.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Price entry not found" });

    const entry = await getPrisma().indexPrice.update({
      where: { id },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(changePercent !== undefined && { changePercent: parseFloat(changePercent) }),
        ...(changeAmount !== undefined && { changeAmount: parseFloat(changeAmount) }),
        ...(dateLabel !== undefined && { dateLabel }),
      },
    });

    return res.status(200).json({ message: "Price entry updated", price: entry });
  } catch (error) {
    console.error("Admin update price error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminDeletePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getPrisma().indexPrice.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Price entry not found" });

    await getPrisma().indexPrice.delete({ where: { id } });
    return res.status(200).json({ message: "Price entry deleted" });
  } catch (error) {
    console.error("Admin delete price error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Index Manager
export const adminGetManager = async (req, res) => {
  try {
    const manager = await getPrisma().indexManager.findFirst({ where: { isActive: true } });
    return res.status(200).json({ manager: manager || null });
  } catch (error) {
    console.error("Admin get manager error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminUpsertManager = async (req, res) => {
  try {
    const { name, title, bio, imageUrl } = req.body;
    if (!name || !title) return res.status(400).json({ message: "name and title are required" });

    const existing = await getPrisma().indexManager.findFirst({ where: { isActive: true } });

    let manager;
    if (existing) {
      manager = await getPrisma().indexManager.update({
        where: { id: existing.id },
        data: { name, title, bio: bio || null, imageUrl: imageUrl || null },
      });
    } else {
      manager = await getPrisma().indexManager.create({
        data: { name, title, bio: bio || null, imageUrl: imageUrl || null },
      });
    }

    return res.status(200).json({ message: "Manager updated", manager });
  } catch (error) {
    console.error("Admin upsert manager error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Investments
export const adminGetInvestments = async (req, res) => {
  try {
    const investments = await getPrisma().indexInvestment.findMany({
      include: {
        tier: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return res.status(200).json({ investments });
  } catch (error) {
    console.error("Admin get investments error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fee / Commission Settings
export const adminGetIndexSettings = async (req, res) => {
  try {
    const settings = await getIndexSettings(getPrisma());
    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Admin get index settings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminUpdateIndexSettings = async (req, res) => {
  try {
    const {
      maintenanceFeePercent, level1Percent, level2Percent, level3Percent, level4Percent, level5Percent,
      earlyWithdrawalPercent, maturityWithdrawalFee,
    } = req.body;
    const settings = await getIndexSettings(getPrisma());

    const updated = await getPrisma().indexSettings.update({
      where: { id: settings.id },
      data: {
        ...(maintenanceFeePercent !== undefined && { maintenanceFeePercent: parseFloat(maintenanceFeePercent) }),
        ...(level1Percent !== undefined && { level1Percent: parseFloat(level1Percent) }),
        ...(level2Percent !== undefined && { level2Percent: parseFloat(level2Percent) }),
        ...(level3Percent !== undefined && { level3Percent: parseFloat(level3Percent) }),
        ...(level4Percent !== undefined && { level4Percent: parseFloat(level4Percent) }),
        ...(level5Percent !== undefined && { level5Percent: parseFloat(level5Percent) }),
        ...(earlyWithdrawalPercent !== undefined && { earlyWithdrawalPercent: parseFloat(earlyWithdrawalPercent) }),
        ...(maturityWithdrawalFee !== undefined && { maturityWithdrawalFee: parseFloat(maturityWithdrawalFee) }),
      },
    });

    return res.status(200).json({ message: "Settings updated", settings: updated });
  } catch (error) {
    console.error("Admin update index settings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
