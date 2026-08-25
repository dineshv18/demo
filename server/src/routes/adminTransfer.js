import { Router } from "express";
import {
  adminGetTransfers, approveTransfer, rejectTransfer,
  adminGetTransferSettings, adminUpdateTransferSettings,
} from "../controllers/transferController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN"));
router.get("/", adminGetTransfers);
router.post("/:id/approve", approveTransfer);
router.post("/:id/reject", rejectTransfer);
router.get("/settings", adminGetTransferSettings);
router.put("/settings", adminUpdateTransferSettings);

export default router;
