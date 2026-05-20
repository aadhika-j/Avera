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
    const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER;
    const resourceType = process.env.CLOUDINARY_UPLOAD_RESOURCE_TYPE;
    if (!uploadFolder || !resourceType) {
      throw createError(500, "Cloudinary upload env not configured");
    }
    const cloudinary = configureCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: uploadFolder,
        resource_type: resourceType,
        access_mode: "public",
        use_filename: true,
        unique_filename: true,
      },
      (error, uploadResult) => {
        if (error) {
          next(createError(500, error.message));
        } else {
          res.status(201).json({
            url: uploadResult.secure_url,
            secureUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: uploadResult.resource_type,
            format: uploadResult.format,
            version: uploadResult.version,
          });
        }
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};
