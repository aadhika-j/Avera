import jwt from "jsonwebtoken";

const DEFAULT_EXPIRY = "7d";

export const signToken = (userId, role, expiresIn = DEFAULT_EXPIRY) =>
  jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, { expiresIn });
