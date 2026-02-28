import createError from "http-errors";
import { Material } from "../models/Material.js";
import { Subject } from "../models/Subject.js";
import { sendEmail } from "../utils/notify.js";

export const createMaterial = async (req, res, next) => {
  try {
    const { title, description, subjectId, url, storageProvider } = req.body;
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw createError(404, "Subject not found");
    }

    const material = await Material.create({
      title,
      description,
      subject: subjectId,
      url,
      storageProvider,
      uploadedBy: req.user._id,
    });
    // Notify uploader via email (placeholder for broadcast)
    if (req.user?.email) {
      sendEmail(
        req.user.email,
        "Material uploaded",
        `Material '${title}' uploaded for ${subject.name}`
      ).catch(() => {});
    }

    res.status(201).json({ material });
  } catch (err) {
    next(err);
  }
};

export const listMaterials = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subject: subjectId } : {};
    const materials = await Material.find(filter)
      .populate("subject")
      .populate("uploadedBy", "name role");
    res.json({ materials });
  } catch (err) {
    next(err);
  }
};

export const getMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id)
      .populate("subject")
      .populate("uploadedBy", "name role");
    if (!material) {
      throw createError(404, "Material not found");
    }
    res.json({ material });
  } catch (err) {
    next(err);
  }
};
