import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createMaterial,
  listMaterials,
} from "../controllers/materialController.js";

const router = Router();

router.get("/", authenticate, listMaterials);
router.post(
  "/",
  authenticate,
  authorize("cr", "admin"),
  createMaterial
);

export default router;
