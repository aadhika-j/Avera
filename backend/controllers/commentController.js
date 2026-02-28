import createError from "http-errors";
import { Comment } from "../models/Comment.js";
import { Material } from "../models/Material.js";

export const listComments = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const comments = await Comment.find({ material: materialId, isDeleted: false })
      .sort({ isPinned: -1, createdAt: -1 })
      .populate("author", "name role")
      .lean();
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const { content, parentComment, mentions } = req.body;

    const material = await Material.findById(materialId);
    if (!material) {
      throw createError(404, "Material not found");
    }

    const comment = await Comment.create({
      material: materialId,
      author: req.user._id,
      content,
      parentComment: parentComment || null,
      mentions,
    });

    if (!parentComment) {
      material.commentCount += 1;
      await material.save();
    }

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

export const pinComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndUpdate(id, { isPinned: true }, { new: true });
    if (!comment) throw createError(404, "Comment not found");
    res.json({ comment });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!comment) throw createError(404, "Comment not found");
    res.json({ comment });
  } catch (err) {
    next(err);
  }
};
