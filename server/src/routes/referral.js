import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getMyStats, getMyCode, getMyReferrals, getHierarchy } from "../controllers/referralController.js";

const router = Router();

router.get("/stats", authenticate, authorize("USER"), getMyStats);
router.get("/my-code", authenticate, authorize("USER"), getMyCode);
router.get("/my-referrals", authenticate, authorize("USER"), getMyReferrals);
router.get("/hierarchy", authenticate, authorize("USER"), getHierarchy);

export default router;
