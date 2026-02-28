import createError from "http-errors";
import { InternalComponent } from "../models/InternalComponent.js";
import { Subject } from "../models/Subject.js";
import { User } from "../models/User.js";
import { sendSms, sendWhatsapp, sendEmail } from "../utils/notify.js";

export const createInternalComponent = async (req, res, next) => {
  try {
    const { subjectId, type, deadline, description } = req.body;
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw createError(404, "Subject not found");
    }

    const component = await InternalComponent.create({
      subject: subjectId,
      type,
      deadline,
      description,
      createdBy: req.user._id,
    });

    // Notify students in the same semester (non-blocking)
    const students = await User.find({ semester: subject.semester, role: "student" }).lean();
    const message = `New ${type} for ${subject.name} due ${new Date(deadline).toLocaleString()}`;
    const tasks = students.flatMap((s) => [
      s.phoneNumber ? sendSms(s.phoneNumber, message) : null,
      s.whatsappNumber ? sendWhatsapp(s.whatsappNumber, message) : null,
      s.email ? sendEmail(s.email, "New assignment", message) : null,
    ]);
    Promise.allSettled(tasks.filter(Boolean)).catch(() => {});

    res.status(201).json({ component });
  } catch (err) {
    next(err);
  }
};

export const listInternalComponents = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subject: subjectId } : {};
    const components = await InternalComponent.find(filter)
      .populate("subject")
      .populate("createdBy", "name role");
    res.json({ components });
  } catch (err) {
    next(err);
  }
};

export const listUpcomingInternalComponents = async (req, res, next) => {
  try {
    const now = new Date();
    const components = await InternalComponent.find({ deadline: { $gte: now } })
      .sort({ deadline: 1 })
      .populate("subject")
      .populate("createdBy", "name role");
    res.json({ components });
  } catch (err) {
    next(err);
  }
};

export const deleteInternalComponent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const component = await InternalComponent.findByIdAndDelete(id);
    if (!component) {
      throw createError(404, "Component not found");
    }
    res.json({ message: "Component deleted" });
  } catch (err) {
    next(err);
  }
};

export const updateInternalComponent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectId, type, deadline, description } = req.body;

    const update = {};
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        throw createError(404, "Subject not found");
      }
      update.subject = subjectId;
    }

    if (type) update.type = type;
    if (deadline) update.deadline = deadline;
    if (description !== undefined) update.description = description;

    const component = await InternalComponent.findByIdAndUpdate(id, update, {
      new: true,
    })
      .populate("subject")
      .populate("createdBy", "name role");

    if (!component) {
      throw createError(404, "Component not found");
    }

    res.json({ component });
  } catch (err) {
    next(err);
  }
};
