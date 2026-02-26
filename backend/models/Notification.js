import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: String, enum: ["whatsapp", "sms", "email", "inapp"], required: true },
    type: { type: String, enum: ["reminder", "event", "material", "chat", "system"], required: true },
    payload: { type: Object, required: true },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    scheduledFor: { type: Date },
    error: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
