import mongoose from "mongoose";

const internalComponentSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    type: {
      type: String,
      enum: [
        "assignment1",
        "assignment2",
        "classTest1",
        "classTest2",
        "presentation",
        "research",
      ],
      required: true,
    },
    deadline: { type: Date, required: true },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    remindersScheduled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

internalComponentSchema.index({ subject: 1, type: 1 }, { unique: true });

export const InternalComponent = mongoose.model(
  "InternalComponent",
  internalComponentSchema
);
