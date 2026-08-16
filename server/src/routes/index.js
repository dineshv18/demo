import { Router } from "express";
import { getIndexData, investInIndex, topUpInvestment, getMyInvestments, withdrawInvestment } from "../controllers/indexController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", getIndexData);
router.get("/investments", getMyInvestments);
router.post("/invest", investInIndex);
router.post("/top-up", topUpInvestment);
router.post("/withdraw", withdrawInvestment);

export default router;
