import createError from "http-errors";
import { User } from "../models/User.js";
import { Semester } from "../models/Semester.js";
import { signToken } from "../utils/jwt.js";

const romanToNumber = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
};

const resolveSemesterId = async (input) => {
  if (!input) return null;

  const raw = typeof input === "string" ? input.trim() : input;
  const asNumber = Number(raw);
  const upper = typeof raw === "string" ? raw.toUpperCase() : "";

  // Try direct ObjectId lookup
  if (typeof raw === "string" && raw.match(/^[a-fA-F0-9]{24}$/)) {
    const byId = await Semester.findById(raw);
    if (byId) return byId._id;
  }

  const number = !Number.isNaN(asNumber)
    ? asNumber
    : romanToNumber[upper] || null;

  if (!number) return null;

  let semesterDoc = await Semester.findOne({ number });
  if (!semesterDoc) {
    const name = Object.entries(romanToNumber).find(([, val]) => val === number)?.[0] || `${number}`;
    semesterDoc = await Semester.create({ number, name });
  }

  return semesterDoc._id;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, semester, phoneNumber, whatsappNumber } =
      req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw createError(409, "User already exists");
    }

    const semesterId = await resolveSemesterId(semester);

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      semester: semesterId,
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
        semester: user.semester,
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
        semester: user.semester,
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
