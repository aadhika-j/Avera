import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    url: { type: String, required: true },
    storageProvider: { type: String, enum: ["cloudinary", "firebase"], required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

materialSchema.index({ subject: 1, createdAt: -1 });

export const Material = mongoose.model("Material", materialSchema);
