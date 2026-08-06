import getPrisma from "../config/db.js";

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

    return res.status(200).json({
      tiers,
      activeTier,
      walletBalance: balance,
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
    const { minAmount, maxAmount, label, weeklyReturn, monthlyReturn, halfYearlyReturn } = req.body;
    if (!minAmount || !maxAmount || !label) {
      return res.status(400).json({ message: "minAmount, maxAmount, and label are required" });
    }

    const tier = await getPrisma().indexTier.create({
      data: {
        minAmount: parseFloat(minAmount),
        maxAmount: parseFloat(maxAmount),
        label,
        weeklyReturn: parseFloat(weeklyReturn || 0),
        monthlyReturn: parseFloat(monthlyReturn || 0),
        halfYearlyReturn: parseFloat(halfYearlyReturn || 0),
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
    const { minAmount, maxAmount, label, weeklyReturn, monthlyReturn, halfYearlyReturn, isActive } = req.body;

    const existing = await getPrisma().indexTier.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Tier not found" });

    const tier = await getPrisma().indexTier.update({
      where: { id },
      data: {
        ...(minAmount !== undefined && { minAmount: parseFloat(minAmount) }),
        ...(maxAmount !== undefined && { maxAmount: parseFloat(maxAmount) }),
        ...(label !== undefined && { label }),
        ...(weeklyReturn !== undefined && { weeklyReturn: parseFloat(weeklyReturn) }),
        ...(monthlyReturn !== undefined && { monthlyReturn: parseFloat(monthlyReturn) }),
        ...(halfYearlyReturn !== undefined && { halfYearlyReturn: parseFloat(halfYearlyReturn) }),
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
