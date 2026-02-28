import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createComment,
  deleteComment,
  listComments,
  pinComment,
} from "../controllers/commentController.js";

const router = Router({ mergeParams: true });

router.get("/", authenticate, listComments);
router.post("/", authenticate, createComment);
router.post("/pin/:id", authenticate, authorize("cr", "admin"), pinComment);
router.delete("/:id", authenticate, authorize("cr", "admin"), deleteComment);

export default router;
