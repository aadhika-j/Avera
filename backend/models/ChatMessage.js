import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "file", "link"], default: "file" },
    name: { type: String, trim: true },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" },
    isPinned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    attachments: [attachmentSchema],
    metadata: {
      typing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ createdAt: -1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
