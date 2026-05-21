import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { handleUpload, uploadMiddleware } from "../controllers/uploadController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("cr", "admin"),
  uploadMiddleware,
  handleUpload
);

export default router;
