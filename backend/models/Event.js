import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    registrationLink: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });

eventSchema.virtual("isUpcoming").get(function isUpcoming() {
  return this.date >= new Date();
});

export const Event = mongoose.model("Event", eventSchema);
