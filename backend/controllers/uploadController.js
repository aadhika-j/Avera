import multer from "multer";
import createError from "http-errors";
import { configureCloudinary } from "../config/cloudinary.js";

const getMaxUploadBytes = () => {
  const maxMb = Number(process.env.UPLOAD_MAX_MB);
  if (!Number.isFinite(maxMb) || maxMb <= 0) {
    return null;
  }
  return Math.round(maxMb * 1024 * 1024);
};

export const uploadMiddleware = (req, res, next) => {
  try {
    const maxBytes = getMaxUploadBytes();
    if (!maxBytes) {
      throw createError(500, "Upload size limit not configured");
    }
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: maxBytes },
    }).single("file");

    upload(req, res, (err) => {
      if (err) return next(err);
      return next();
    });
  } catch (err) {
    next(err);
  }
};

const parseResourceTypeFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/res\.cloudinary\.com\/[^/]+\/([^/]+)\/upload\//i);
  return match?.[1] || null;
};

export const getSignedUrl = async (req, res, next) => {
  try {
    const { publicId, resourceType, format, version, url } = req.body || {};
    if (!publicId) {
      throw createError(400, "publicId is required");
    }

    const resolvedResourceType = resourceType || parseResourceTypeFromUrl(url);
    if (!resolvedResourceType) {
      throw createError(400, "resourceType is required");
    }

    const deliveryType = process.env.CLOUDINARY_DELIVERY_TYPE || "authenticated";
    const ttlSeconds = Number(process.env.CLOUDINARY_SIGNED_URL_TTL_SEC) || 3600;
    const options = {
      secure: true,
      sign_url: true,
      resource_type: resolvedResourceType,
      type: deliveryType,
    };
    if (format) options.format = format;
    if (version) options.version = version;
    if (ttlSeconds) {
      options.expires_at = Math.floor(Date.now() / 1000) + ttlSeconds;
    }

    const cloudinary = configureCloudinary();
    const signedUrl = cloudinary.url(publicId, options);
    res.json({ url: signedUrl });
  } catch (err) {
    next(err);
  }
};

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
    const largeThresholdMb = Number(process.env.CLOUDINARY_LARGE_UPLOAD_THRESHOLD_MB) || 95;
    const largeThresholdBytes = Math.round(largeThresholdMb * 1024 * 1024);
    const useLargeUpload = req.file.size >= largeThresholdBytes;
    const uploader = useLargeUpload
      ? cloudinary.uploader.upload_large_stream
      : cloudinary.uploader.upload_stream;

    const stream = uploader(
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
            size: uploadResult.bytes,
            originalFilename: uploadResult.original_filename,
          });
        }
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};
