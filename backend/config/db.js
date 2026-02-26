import mongoose from "mongoose";

export const connectDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("Missing MongoDB connection string");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
};
