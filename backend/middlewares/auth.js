import jwt from "jsonwebtoken";
import createError from "http-errors";
import { User } from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      throw createError(401, "Authentication required");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-password");
    if (!user) {
      throw createError(401, "Invalid authentication token");
    }

    req.user = user;
    next();
  } catch (err) {
    next(createError(err.status || 401, err.message || "Unauthorized"));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(createError(401, "Authentication required"));
  }

  if (!roles.includes(req.user.role)) {
    return next(createError(403, "Access denied"));
  }

  return next();
};
