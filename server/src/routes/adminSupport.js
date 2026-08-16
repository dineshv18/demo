import { Router } from "express";
import { adminGetTickets, adminGetTicketDetail, adminUpdateTicket } from "../controllers/supportController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", authorize("SUPER_ADMIN", "ADMIN"), adminGetTickets);
router.get("/:id", authorize("SUPER_ADMIN", "ADMIN"), adminGetTicketDetail);
router.put("/:id", authorize("SUPER_ADMIN", "ADMIN"), adminUpdateTicket);

export default router;
