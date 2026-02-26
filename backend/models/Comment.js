import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPinned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ material: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
