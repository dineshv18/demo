import { Router } from "express";
import { searchRecipients, createTransfer, getMyTransfers } from "../controllers/transferController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/search", searchRecipients);
router.get("/my-transfers", getMyTransfers);
router.post("/", createTransfer);

export default router;
