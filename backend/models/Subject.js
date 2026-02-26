import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
  },
  { timestamps: true }
);

subjectSchema.index({ semester: 1, code: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", subjectSchema);
