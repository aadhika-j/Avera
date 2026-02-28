import createError from "http-errors";
import { Semester } from "../models/Semester.js";

export const listSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.find({}).sort({ number: 1 });
    res.json({ semesters });
  } catch (err) {
    next(err);
  }
};

export const createSemester = async (req, res, next) => {
  try {
    const { name, number } = req.body;
    const existing = await Semester.findOne({ number });
    if (existing) throw createError(409, "Semester already exists");
    const semester = await Semester.create({ name, number });
    res.status(201).json({ semester });
  } catch (err) {
    next(err);
  }
};
