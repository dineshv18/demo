import { Router } from "express";
import { getAllPayments, getPaymentDetail, approvePayment, rejectPayment } from "../controllers/adminPaymentsController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN"));
router.get("/", getAllPayments);
router.get("/:id", getPaymentDetail);
router.post("/:id/approve", approvePayment);
router.post("/:id/reject", rejectPayment);

export default router;