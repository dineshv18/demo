import { Router } from "express";
import multer from "multer";
import {
  adminGetTiers, adminCreateTier, adminUpdateTier, adminDeleteTier, adminUploadTierImage,
  adminGetPrices, adminCreatePrice, adminUpdatePrice, adminDeletePrice,
  adminGetManager, adminUpsertManager,
  adminGetFundAllocations, adminCreateFundAllocation, adminUpdateFundAllocation, adminDeleteFundAllocation,
  adminUploadFundAllocationImage,
  adminGetInvestments,
  adminGetIndexSettings, adminUpdateIndexSettings,
} from "../controllers/indexController.js";
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

// Tiers
router.get("/tiers", adminGetTiers);
router.post("/tiers", adminCreateTier);
router.put("/tiers/:id", adminUpdateTier);
router.delete("/tiers/:id", adminDeleteTier);
router.post("/tiers/upload-image", upload.single("image"), adminUploadTierImage);

// Price History
router.get("/prices", adminGetPrices);
router.post("/prices", adminCreatePrice);
router.put("/prices/:id", adminUpdatePrice);
router.delete("/prices/:id", adminDeletePrice);

// Manager
router.get("/manager", adminGetManager);
router.post("/manager", adminUpsertManager);

// Fund Allocation
router.get("/fund-allocations", adminGetFundAllocations);
router.post("/fund-allocations", adminCreateFundAllocation);
router.put("/fund-allocations/:id", adminUpdateFundAllocation);
router.delete("/fund-allocations/:id", adminDeleteFundAllocation);
router.post("/fund-allocations/upload-image", upload.single("image"), adminUploadFundAllocationImage);

// Investments
router.get("/investments", adminGetInvestments);

// Fee / Commission Settings
router.get("/settings", adminGetIndexSettings);
router.put("/settings", adminUpdateIndexSettings);

export default router;
