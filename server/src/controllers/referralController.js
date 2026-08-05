import getPrisma from "../config/db.js";
import crypto from "crypto";

function generateCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export const getMyCode = async (req, res) => {
  try {
    let user = await getPrisma().user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.referralCode) {
      const code = generateCode();
      let attempts = 0;
      while (attempts < 10) {
        try {
          user = await getPrisma().user.update({ where: { id: req.user.id }, data: { referralCode: code } });
          break;
        } catch {
          attempts++;
        }
      }
      if (attempts >= 10) return res.status(500).json({ message: "Failed to generate referral code" });
    }

    const referralLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/register?ref=${user.referralCode}`;

    return res.status(200).json({ code: user.referralCode, link: referralLink });
  } catch (error) {
    console.error("Get referral code error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyReferrals = async (req, res) => {
  try {
    const referrals = await getPrisma().referral.findMany({
      where: { referrerId: req.user.id },
      include: {
        referred: { select: { id: true, name: true, email: true, createdAt: true } },
        commissions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: referrals.length,
      registered: referrals.filter(r => r.status === "REGISTERED").length,
      kycDone: referrals.filter(r => r.status === "KYC_DONE" || r.status === "DEPOSITED" || r.status === "COMMISSION_PAID").length,
      deposited: referrals.filter(r => r.status === "DEPOSITED" || r.status === "COMMISSION_PAID").length,
      totalCommission: referrals.reduce((sum, r) => sum + r.commissions.reduce((cs, c) => cs + parseFloat(c.amount), 0), 0),
    };

    return res.status(200).json({ referrals, stats });
  } catch (error) {
    console.error("Get referrals error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getHierarchy = async (req, res) => {
  try {
    const directReferrals = await getPrisma().referral.findMany({
      where: { referrerId: req.user.id },
      include: {
        referred: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });

    const hierarchy = await Promise.all(
      directReferrals.map(async (ref) => {
        const subReferrals = await getPrisma().referral.findMany({
          where: { referrerId: ref.referredId },
          include: {
            referred: { select: { id: true, name: true, email: true, createdAt: true } },
          },
        });
        return {
          ...ref,
          level: 1,
          subReferrals: subReferrals.map(sr => ({ ...sr, level: 2 })),
        };
      })
    );

    return res.status(200).json({ hierarchy });
  } catch (error) {
    console.error("Get hierarchy error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSettings = async (req, res) => {
  try {
    let settings = await getPrisma().referralSettings.findFirst();
    if (!settings) {
      settings = await getPrisma().referralSettings.create({ data: { commissionRate: 2 } });
    }
    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Get referral settings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ message: "Commission rate must be between 0 and 100" });
    }

    let settings = await getPrisma().referralSettings.findFirst();
    if (!settings) {
      settings = await getPrisma().referralSettings.create({ data: { commissionRate: parseFloat(commissionRate) } });
    } else {
      settings = await getPrisma().referralSettings.update({
        where: { id: settings.id },
        data: { commissionRate: parseFloat(commissionRate) },
      });
    }

    return res.status(200).json({ message: "Settings updated", settings });
  } catch (error) {
    console.error("Update referral settings error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const [referrals, total] = await Promise.all([
      getPrisma().referral.findMany({
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          referred: { select: { id: true, name: true, email: true } },
          commissions: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      getPrisma().referral.count(),
    ]);

    return res.status(200).json({ referrals, total, page: parseInt(page), limit: take });
  } catch (error) {
    console.error("Get all referrals error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export async function processReferralCommission(prisma, depositTx) {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { id: depositTx.walletId } });
    if (!wallet) return;

    const referral = await prisma.referral.findUnique({ where: { referredId: wallet.userId } });
    if (!referral) return;

    let settings = await prisma.referralSettings.findFirst();
    if (!settings) {
      settings = await prisma.referralSettings.create({ data: { commissionRate: 2 } });
    }

    const percentage = parseFloat(settings.commissionRate);
    const depositAmount = parseFloat(depositTx.amount);
    const commissionAmount = (depositAmount * percentage) / 100;

    if (commissionAmount <= 0) return;

    const referrerWallet = await prisma.wallet.findUnique({ where: { userId: referral.referrerId } });
    if (!referrerWallet) return;

    await prisma.wallet.update({
      where: { id: referrerWallet.id },
      data: { balance: { increment: commissionAmount } },
    });

    await prisma.referralCommission.create({
      data: {
        referralId: referral.id,
        userId: referral.referrerId,
        amount: commissionAmount,
        percentage,
        status: "PAID",
        depositTxId: depositTx.id,
      },
    });

    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: "COMMISSION_PAID", depositedAt: new Date() },
    });

    console.log(`[REFERRAL] Commission $${commissionAmount} credited to referrer ${referral.referrerId} for deposit ${depositTx.id}`);
  } catch (error) {
    console.error("Process referral commission error:", error);
  }
}

export async function processReferralKyc(userId) {
  try {
    const referral = await getPrisma().referral.findUnique({ where: { referredId: userId } });
    if (!referral) return;
    if (referral.status === "REGISTERED") {
      await getPrisma().referral.update({
        where: { id: referral.id },
        data: { status: "KYC_DONE", kycAt: new Date() },
      });
    }
  } catch (error) {
    console.error("Process referral KYC error:", error);
  }
}
