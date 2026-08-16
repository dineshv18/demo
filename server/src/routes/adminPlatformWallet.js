import { Router } from "express";
import {
  getPlatformWallet, getPlatformLedger,
  requestPlatformWithdrawal, getPlatformWithdrawals, processPlatformWithdrawal,
} from "../controllers/platformWalletController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.use(authorize("SUPER_ADMIN", "ADMIN"));

router.get("/", getPlatformWallet);
router.get("/ledger", getPlatformLedger);
router.get("/withdrawals", getPlatformWithdrawals);
router.post("/withdrawals", requestPlatformWithdrawal);
router.post("/withdrawals/:id/process", processPlatformWithdrawal);

export default router;
