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
          try {
            const signedUrl = cloudinary.url(uploadResult.public_id, {
              secure: true,
              sign_url: true,
              resource_type: uploadResult.resource_type || "auto",
            });
            res.status(201).json({
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              resourceType: uploadResult.resource_type,
              signedUrl,
            });
          } catch (signErr) {
            res.status(201).json({
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              resourceType: uploadResult.resource_type,
            });
          }
        }
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};
