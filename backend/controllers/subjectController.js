import createError from "http-errors";
import { Subject } from "../models/Subject.js";
import { Semester } from "../models/Semester.js";

const resolveSemester = async (semesterInput) => {
  if (!semesterInput) return null;

  if (typeof semesterInput === "string" && semesterInput.match(/^[a-fA-F0-9]{24}$/)) {
    const byId = await Semester.findById(semesterInput);
    if (byId) return byId;
  }

  const asNumber = Number(semesterInput);
  if (!Number.isNaN(asNumber)) {
    let semesterDoc = await Semester.findOne({ number: asNumber });
    if (!semesterDoc) {
      const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"][asNumber] || `${asNumber}`;
      semesterDoc = await Semester.create({ name: roman, number: asNumber });
    }
    return semesterDoc;
  }

  return null;
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, semesterId } = req.body;
    const semester = await resolveSemester(semesterId);
    if (!semester) {
      throw createError(404, "Semester not found");
    }

    const subject = await Subject.create({ name, code, semester });
    res.status(201).json({ subject });
  } catch (err) {
    next(err);
  }
};

export const listSubjects = async (req, res, next) => {
  try {
    const { semesterId } = req.query;
    const filter = semesterId ? { semester: semesterId } : {};
    const subjects = await Subject.find(filter).populate("semester");
    res.json({ subjects });
  } catch (err) {
    next(err);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      throw createError(404, "Subject not found");
    }
    res.json({ message: "Subject deleted" });
  } catch (err) {
    next(err);
  }
};
