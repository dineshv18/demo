import { Router } from "express";
import multer from "multer";
import { getKycStatus, submitKyc, sendEmailOtp, verifyEmailOtp } from "../controllers/kycController.js";
import { authenticate } from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();
router.use(authenticate);
router.get("/status", getKycStatus);
router.post("/email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/submit", upload.single("document"), submitKyc);

export default router;