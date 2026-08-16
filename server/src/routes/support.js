import { Router } from "express";
import { createTicket, getMyTickets } from "../controllers/supportController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.post("/", authorize("USER"), createTicket);
router.get("/my-tickets", authorize("USER"), getMyTickets);

export default router;
