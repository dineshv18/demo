import { Router } from "express";
import multer from "multer";
import {
  getWallet, getTransactions, getMyTransactionHistory, requestDeposit, requestWithdrawal, setCurrency,
  transferBonusToWallet, requestBonusWithdrawal,
} from "../controllers/walletController.js";
import { authenticate } from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();
router.use(authenticate);
router.get("/", getWallet);
router.get("/transactions", getTransactions);
router.get("/transactions/history", getMyTransactionHistory);
router.post("/currency", setCurrency);
router.post("/deposit", upload.single("screenshot"), requestDeposit);
router.post("/withdraw", requestWithdrawal);
router.post("/bonus/transfer", transferBonusToWallet);
router.post("/bonus/withdraw", requestBonusWithdrawal);

export default router;