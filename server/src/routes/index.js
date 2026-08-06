import { Router } from "express";
import { getIndexData } from "../controllers/indexController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", getIndexData);

export default router;
