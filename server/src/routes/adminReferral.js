import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getSettings, updateSettings, getAllReferrals } from "../controllers/referralController.js";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN"));

router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/", getAllReferrals);

export default router;
