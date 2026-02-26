import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { listNotifications } from "../controllers/notificationController.js";

const router = Router();

router.get("/", authenticate, listNotifications);

export default router;
