import { Router } from "express";
import multer from "multer";
import { getWallet, getTransactions, requestDeposit, requestWithdrawal, setCurrency } from "../controllers/walletController.js";
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
router.post("/currency", setCurrency);
router.post("/deposit", upload.single("screenshot"), requestDeposit);
router.post("/withdraw", requestWithdrawal);

export default router;