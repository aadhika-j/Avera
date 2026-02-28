import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { createSemester, listSemesters } from "../controllers/semesterController.js";

const router = Router();

router.get("/", authenticate, listSemesters);
router.post("/", authenticate, authorize("cr", "admin"), createSemester);

export default router;
