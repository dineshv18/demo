import { Router } from "express";
import { getAllKyc, getKycDetail, approveKyc, rejectKyc } from "../controllers/adminKycController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("SUPER_ADMIN", "ADMIN"), getAllKyc);
router.get("/:id", authorize("SUPER_ADMIN", "ADMIN"), getKycDetail);
router.post("/:id/approve", authorize("SUPER_ADMIN", "ADMIN"), approveKyc);
router.post("/:id/reject", authorize("SUPER_ADMIN", "ADMIN"), rejectKyc);

export default router;