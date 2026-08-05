import getPrisma from "../config/db.js";
import crypto from "crypto";

const generateOTP = () => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
};

export const getKycStatus = async (req, res) => {
  try {
    let kyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!kyc) {
      kyc = await getPrisma().kyc.create({ data: { userId: req.user.id } });
    }
    return res.status(200).json({ kyc });
  } catch (error) {
    console.error("Get KYC error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const submitKyc = async (req, res) => {
  try {
    const { fullName, phone, countryCode, gender, dateOfBirth, country, governmentIdType } = req.body;
    const file = req.file;

    if (!fullName || !phone || !countryCode || !gender || !dateOfBirth || !country || !governmentIdType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!file) return res.status(400).json({ message: "Document image is required" });
    if (file.size > 5 * 1024 * 1024) return res.status(400).json({ message: "File size must be under 5MB" });
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) return res.status(400).json({ message: "File must be JPEG, PNG, WebP, or PDF" });

    let kyc = await getPrisma().kyc.findUnique({ where: { userId: req.user.id } });
    if (!kyc) kyc = await getPrisma().kyc.create({ data: { userId: req.user.id } });

    if (kyc.status === "PENDING") return res.status(400).json({ message: "KYC already submitted. Please wait for review." });
    if (kyc.status === "APPROVED") return res.status(400).json({ message: "KYC already approved." });
    if (kyc.status === "REJECTED" && kyc.resubmitAfter && new Date() < kyc.resubmitAfter) {
      const hours = Math.ceil((kyc.resubmitAfter - new Date()) / (1000 * 60 * 60));
      return res.status(400).json({ message: `You can resubmit KYC after ${hours} hours.` });
    }

    const { uploadToR2 } = await import("../config/r2.js");
    const doc = await uploadToR2(file, "kyc-documents");

    const age = Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    const updatedKyc = await getPrisma().kyc.update({
      where: { userId: req.user.id },
      data: {
        fullName: fullName.trim(),
        email: req.user.email,
        phone: phone.trim(),
        countryCode: countryCode.trim(),
        gender,
        dateOfBirth: new Date(dateOfBirth),
        age,
        country,
        governmentIdType,
        documentUrl: doc.url,
        documentFileName: file.originalname,
        status: "PENDING",
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });

    return res.status(200).json({ message: "KYC submitted successfully. Our team will review within 12-24 working hours.", kyc: updatedKyc });
  } catch (error) {
    console.error("Submit KYC error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendEmailOtp = async (req, res) => {
  try {
    if (!req.user.email) return res.status(400).json({ message: "Email not found in your account" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await getPrisma().user.update({
      where: { id: req.user.id },
      data: { phoneOtp: otp, phoneOtpExpiry: expiry },
    });

    const { sendOTP } = await import("../config/nodemailer.js");
    await sendOTP(req.user.email, otp);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send email OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const user = await getPrisma().user.findUnique({ where: { id: req.user.id } });
    if (!user.phoneOtp || user.phoneOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.phoneOtpExpiry && new Date() > user.phoneOtpExpiry) return res.status(400).json({ message: "OTP expired. Request a new one." });

    await getPrisma().user.update({
      where: { id: req.user.id },
      data: { phoneOtp: null, phoneOtpExpiry: null },
    });

    await getPrisma().kyc.upsert({
      where: { userId: req.user.id },
      update: { emailVerified: true },
      create: { userId: req.user.id, emailVerified: true },
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};