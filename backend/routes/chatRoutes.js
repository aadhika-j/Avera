import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { listMessages, postMessage, markRead } from "../controllers/chatController.js";

const router = Router();

router.get("/", authenticate, listMessages);
router.post("/", authenticate, postMessage);
router.post("/read", authenticate, markRead);

export default router;
