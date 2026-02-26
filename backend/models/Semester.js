import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    number: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

semesterSchema.index({ number: 1 }, { unique: true });

export const Semester = mongoose.model("Semester", semesterSchema);
