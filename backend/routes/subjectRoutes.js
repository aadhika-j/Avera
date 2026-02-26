import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createSubject,
  deleteSubject,
  listSubjects,
} from "../controllers/subjectController.js";

const router = Router();

router.get("/", authenticate, listSubjects);
router.post("/", authenticate, authorize("cr", "admin"), createSubject);
router.delete(
  "/:id",
  authenticate,
  authorize("cr", "admin"),
  deleteSubject
);

export default router;
