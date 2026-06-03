import createError from "http-errors";
import mongoose from "mongoose";
import { InternalComponent } from "../models/InternalComponent.js";
import { Subject } from "../models/Subject.js";
import { User } from "../models/User.js";
import { sendSms, sendWhatsapp, sendEmail } from "../utils/notify.js";
import {
  newReminderEmail,
  newAttachmentEmail,
  typeLabel,
} from "../utils/emailTemplates.js";

export const createInternalComponent = async (req, res, next) => {
  try {
    const { subjectId, type, deadline, description, attachments, attachmentNote } = req.body;
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw createError(404, "Subject not found");
    }

    const component = await InternalComponent.create({
      subject: subjectId,
      type,
      deadline,
      description,
      attachments: attachments || [],
      attachmentNote,
      createdBy: req.user._id,
    });

    // ── Notify users in the same semester (non-blocking) ──────────────────
    const usersInSemester = await User.find({
      semester: subject.semester,
      _id: { $ne: req.user._id },
    }).lean();

    const plainMessage = `New ${typeLabel(type)} for ${subject.name} due ${new Date(deadline).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;

    // SMS / WhatsApp — students only
    const smsWhatsappTasks = usersInSemester
      .filter((s) => s.role === "student")
      .flatMap((s) => [
        s.phoneNumber ? sendSms(s.phoneNumber, plainMessage) : null,
        s.whatsappNumber ? sendWhatsapp(s.whatsappNumber, plainMessage) : null,
      ]);
    Promise.allSettled(smsWhatsappTasks.filter(Boolean)).catch(() => {});

    // Themed email — all users in semester
    const frontendUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",")[0].trim();
    const emailTasks = usersInSemester
      .filter((u) => u.email)
      .map((u) => {
        const html = newReminderEmail({
          userName: u.name,
          componentType: type,
          subjectName: subject.name,
          deadline,
          description,
          viewUrl: `${frontendUrl}/reminders`,
        });
        return sendEmail(
          u.email,
          `New ${typeLabel(type)}: ${subject.name} | AVERA`,
          plainMessage,
          html,
        );
      });
    Promise.allSettled(emailTasks).catch(() => {});

    res.status(201).json({ component });
  } catch (err) {
    next(err);
  }
};

export const listInternalComponents = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = {};

    if (subjectId) {
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        throw createError(400, "Invalid subject id");
      }
      filter.subject = subjectId;
    }

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
    const { subjectId, type, deadline, description, attachments, attachmentNote } = req.body;

    // Fetch current state so we can detect new attachments
    const current = await InternalComponent.findById(id).populate("subject");
    if (!current) {
      throw createError(404, "Component not found");
    }

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
    if (attachments !== undefined) update.attachments = attachments;
    if (attachmentNote !== undefined) update.attachmentNote = attachmentNote;

    const component = await InternalComponent.findByIdAndUpdate(id, update, {
      new: true,
    })
      .populate("subject")
      .populate("createdBy", "name role");

    if (!component) {
      throw createError(404, "Component not found");
    }

    // ── Detect new attachments and notify ──────────────────────────────────
    if (
      attachments !== undefined &&
      attachments.length > (current.attachments?.length || 0)
    ) {
      const newAtts = attachments.slice(current.attachments?.length || 0);
      const subjectDoc = component.subject || current.subject;

      if (subjectDoc) {
        const usersInSemester = await User.find({
          semester: subjectDoc.semester,
          _id: { $ne: req.user._id },
        }).lean();

        const frontendUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",")[0].trim();
        const plainMessage = `A new attachment has been added in ${subjectDoc.name} (${typeLabel(component.type)}). Please check.`;

        const emailTasks = usersInSemester
          .filter((u) => u.email)
          .map((u) => {
            const html = newAttachmentEmail({
              userName: u.name,
              subjectName: subjectDoc.name,
              componentType: component.type,
              attachmentNames: newAtts.map((a) => a.name || "Untitled"),
              viewUrl: `${frontendUrl}/subjects`,
            });
            return sendEmail(
              u.email,
              `New attachment in ${subjectDoc.name} | AVERA`,
              plainMessage,
              html,
            );
          });
        Promise.allSettled(emailTasks).catch(() => {});
      }
    }

    res.json({ component });
  } catch (err) {
    next(err);
  }
};
