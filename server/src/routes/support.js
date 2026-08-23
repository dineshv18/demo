import { Router } from "express";
import multer from "multer";
import { createTicket, getMyTickets } from "../controllers/supportController.js";
import { authenticate, authorize } from "../middleware/auth.js";

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
router.post("/", authorize("USER"), upload.array("screenshots", 3), createTicket);
router.get("/my-tickets", authorize("USER"), getMyTickets);

export default router;
