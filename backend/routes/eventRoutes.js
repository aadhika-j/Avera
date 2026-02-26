import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createEvent,
  deleteEvent,
  listEvents,
} from "../controllers/eventController.js";

const router = Router();

router.get("/", authenticate, listEvents);
router.post("/", authenticate, authorize("cr", "admin"), createEvent);
router.delete(
  "/:id",
  authenticate,
  authorize("cr", "admin"),
  deleteEvent
);

export default router;
