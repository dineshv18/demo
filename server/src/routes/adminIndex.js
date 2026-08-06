import { Router } from "express";
import {
  adminGetTiers, adminCreateTier, adminUpdateTier, adminDeleteTier,
  adminGetPrices, adminCreatePrice, adminUpdatePrice, adminDeletePrice,
  adminGetManager, adminUpsertManager,
} from "../controllers/indexController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Tiers
router.get("/tiers", adminGetTiers);
router.post("/tiers", adminCreateTier);
router.put("/tiers/:id", adminUpdateTier);
router.delete("/tiers/:id", adminDeleteTier);

// Price History
router.get("/prices", adminGetPrices);
router.post("/prices", adminCreatePrice);
router.put("/prices/:id", adminUpdatePrice);
router.delete("/prices/:id", adminDeletePrice);

// Manager
router.get("/manager", adminGetManager);
router.post("/manager", adminUpsertManager);

export default router;
