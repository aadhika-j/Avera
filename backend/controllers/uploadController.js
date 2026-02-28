import multer from "multer";
import createError from "http-errors";
import { configureCloudinary } from "../config/cloudinary.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

export const uploadMiddleware = upload.single("file");

export const handleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, "File is required");
    }
    const cloudinary = configureCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "avera/materials",
        resource_type: "auto",
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      },
      (error, uploadResult) => {
        if (error) {
          next(createError(500, error.message));
        } else {
          res.status(201).json({ url: uploadResult.secure_url, publicId: uploadResult.public_id });
        }
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};
