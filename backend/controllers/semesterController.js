import createError from "http-errors";
import { Semester } from "../models/Semester.js";

const defaultSemesters = [
  { number: 1, name: "I" },
  { number: 2, name: "II" },
  { number: 3, name: "III" },
  { number: 4, name: "IV" },
  { number: 5, name: "V" },
  { number: 6, name: "VI" },
  { number: 7, name: "VII" },
  { number: 8, name: "VIII" },
];

export const listSemesters = async (req, res, next) => {
  try {
    let semesters = await Semester.find({}).sort({ number: 1 });

    if (!semesters.length) {
      await Semester.insertMany(defaultSemesters);
      semesters = await Semester.find({}).sort({ number: 1 });
    }

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
