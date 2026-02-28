import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createInternalComponent,
  deleteInternalComponent,
  listUpcomingInternalComponents,
  listInternalComponents,
  updateInternalComponent,
} from "../controllers/internalComponentController.js";

const router = Router();

router.get("/", authenticate, listInternalComponents);
router.get("/upcoming", authenticate, listUpcomingInternalComponents);
router.post(
  "/",
  authenticate,
  authorize("cr", "admin"),
  createInternalComponent
);
router.put(
  "/:id",
  authenticate,
  authorize("cr", "admin"),
  updateInternalComponent
);
router.delete(
  "/:id",
  authenticate,
  authorize("cr", "admin"),
  deleteInternalComponent
);

export default router;
