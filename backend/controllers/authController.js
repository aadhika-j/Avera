import createError from "http-errors";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, semester, phoneNumber, whatsappNumber } =
      req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw createError(409, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      semester,
      phoneNumber,
      whatsappNumber,
    });

    const token = signToken(user._id, user.role);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, "Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw createError(401, "Invalid credentials");
    }

    const token = signToken(user._id, user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, "Unauthorized");
    }
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
