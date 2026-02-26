import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { listMessages, postMessage } from "../controllers/chatController.js";

const router = Router();

router.get("/", authenticate, listMessages);
router.post("/", authenticate, postMessage);

export default router;
