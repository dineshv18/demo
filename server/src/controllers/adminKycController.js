import getPrisma from "../config/db.js";
import { logActivity } from "../middleware/activityLog.js";
import { processReferralKyc } from "./referralController.js";

// Map Prisma Kyc record → admin API shape
function mapKyc(kyc) {
  return {
    id: kyc.id,
    userId: kyc.userId,
    fullName: kyc.fullName,
    email: kyc.email || kyc.user?.email || null,
    phone: kyc.phone
      ? { countryCode: kyc.countryCode || "", number: kyc.phone }
      : null,
    gender: kyc.gender,
    dateOfBirth: kyc.dateOfBirth,
    age: kyc.age,
    country: kyc.country,
    governmentIdType: kyc.governmentIdType,
    documentUrl: kyc.documentUrl,
    documentFileName: kyc.documentFileName,
    documentUrlBack: kyc.documentUrlBack,
    documentFileNameBack: kyc.documentFileNameBack,
    addressProofType: kyc.addressProofType,
    addressDocUrl: kyc.addressDocUrl,
    addressDocFileName: kyc.addressDocFileName,
    addressDocUrlBack: kyc.addressDocUrlBack,
    addressDocFileNameBack: kyc.addressDocFileNameBack,
    status: kyc.status,
    rejectionReason: kyc.rejectionReason,
    reviewedBy: kyc.reviewedBy,
    reviewedAt: kyc.reviewedAt,
    createdAt: kyc.createdAt,
    user: kyc.user,
  };
}

export const getAllKyc = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : { status: { not: "NOT_STARTED" } };
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const [kycs, total, pending, approved, rejected] = await Promise.all([
      getPrisma().kyc.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      getPrisma().kyc.count({ where }),
      getPrisma().kyc.count({ where: { status: "PENDING" } }),
      getPrisma().kyc.count({ where: { status: "APPROVED" } }),
      getPrisma().kyc.count({ where: { status: "REJECTED" } }),
    ]);

    return res.status(200).json({
      submissions: kycs.map(mapKyc),
      total,
      page: parseInt(page) || 1,
      limit: take,
      counts: { pending, approved, rejected, total: pending + approved + rejected },
    });
  } catch (error) {
    console.error("Admin get KYC error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getKycDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const kyc = await getPrisma().kyc.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    if (!kyc) return res.status(404).json({ message: "KYC not found" });
    return res.status(200).json({ submission: mapKyc(kyc) });
  } catch (error) {
    console.error("Admin get KYC detail error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const kyc = await getPrisma().kyc.findUnique({ where: { id } });
    if (!kyc) return res.status(404).json({ message: "KYC not found" });
    if (kyc.status !== "PENDING") return res.status(400).json({ message: "KYC is not pending review" });

    const updated = await getPrisma().kyc.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    const user = await getPrisma().user.findUnique({ where: { id: kyc.userId } });
    if (user) {
      try {
        const { sendOTP } = await import("../config/nodemailer.js");
        const getEnv = (await import("../config/env.js")).default;
        const env = getEnv();
        const { getTransporter } = await import("../config/nodemailer.js");
        await getTransporter().sendMail({
          from: `"${env.BREVO_SENDER_NAME}" <${env.BREVO_SENDER_EMAIL}>`,
          to: user.email,
          subject: "KYC Verification Approved - ORVANTA Financial",
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;"><tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 40px;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:22px;">KYC Approved!</h1>
                </td></tr>
                <tr><td style="padding:40px;text-align:center;">
                  <p style="color:#374151;font-size:15px;">Hello ${user.name},</p>
                  <p style="color:#6b7280;font-size:14px;line-height:1.6;">Your identity verification has been approved. You can now deposit and withdraw funds on your account.</p>
                  <a href="${env.CLIENT_URL || 'http://localhost:3000'}/dashboard/wallet" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;margin-top:24px;">Go to Wallet</a>
                </td></tr>
              </table>
            </td></tr></table>
          </body></html>`,
        });
      } catch (mailErr) {
        console.error("KYC approval email failed:", mailErr);
      }
    }

    await processReferralKyc(kyc.userId);

    await logActivity({
      userId: req.user.id,
      action: "KYC_APPROVED",
      page: "kyc",
      details: { kycId: id, targetUserId: kyc.userId, userName: user?.name },
      req,
    });

    return res.status(200).json({ message: "KYC approved", submission: mapKyc({ ...updated, user }) });
  } catch (error) {
    console.error("Approve KYC error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Rejection reason is required" });

    const kyc = await getPrisma().kyc.findUnique({ where: { id } });
    if (!kyc) return res.status(404).json({ message: "KYC not found" });
    if (kyc.status !== "PENDING") return res.status(400).json({ message: "KYC is not pending review" });

    const resubmitAfter = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const updated = await getPrisma().kyc.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        resubmitAfter,
      },
    });

    const user = await getPrisma().user.findUnique({ where: { id: kyc.userId } });
    if (user) {
      try {
        const { getTransporter } = await import("../config/nodemailer.js");
        const getEnv = (await import("../config/env.js")).default;
        const env = getEnv();
        await getTransporter().sendMail({
          from: `"${env.BREVO_SENDER_NAME}" <${env.BREVO_SENDER_EMAIL}>`,
          to: user.email,
          subject: "KYC Verification Rejected - ORVANTA Financial",
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;"><tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <tr><td style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px 40px;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:22px;">KYC Not Approved</h1>
                </td></tr>
                <tr><td style="padding:40px;text-align:center;">
                  <p style="color:#374151;font-size:15px;">Hello ${user.name},</p>
                  <p style="color:#6b7280;font-size:14px;line-height:1.6;">Unfortunately, your identity verification could not be approved at this time.</p>
                  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:20px 0;">
                    <p style="color:#991b1b;font-size:13px;font-weight:600;margin:0 0 4px;">Reason:</p>
                    <p style="color:#991b1b;font-size:13px;margin:0;">${reason}</p>
                  </div>
                  <p style="color:#6b7280;font-size:14px;">You can resubmit your KYC after <strong>72 hours</strong> from now.</p>
                </td></tr>
              </table>
            </td></tr></table>
          </body></html>`,
        });
      } catch (mailErr) {
        console.error("KYC rejection email failed:", mailErr);
      }
    }

    await logActivity({
      userId: req.user.id,
      action: "KYC_REJECTED",
      page: "kyc",
      details: { kycId: id, targetUserId: kyc.userId, userName: user?.name, reason },
      req,
    });

    return res.status(200).json({ message: "KYC rejected", submission: mapKyc({ ...updated, user }) });
  } catch (error) {
    console.error("Reject KYC error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
