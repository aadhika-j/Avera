import mongoose from "mongoose";

export const connectDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("Missing MongoDB connection string");
  }

  mongoose.set("strictQuery", true);

  const isProd = process.env.NODE_ENV === "production";
  await mongoose.connect(mongoUri, {
    autoIndex: !isProd,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 0,
    serverSelectionTimeoutMS: 5000,
  });
};
