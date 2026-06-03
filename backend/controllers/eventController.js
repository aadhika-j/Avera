import createError from "http-errors";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/notify.js";
import { newEventEmail } from "../utils/emailTemplates.js";

export const createEvent = async (req, res, next) => {
  try {
    const { name, date, description, registrationLink, tags } = req.body;
    const event = await Event.create({
      name,
      date,
      description,
      registrationLink,
      tags,
      createdBy: req.user._id,
    });

    // ── Email all users about the new event (non-blocking) ────────────────
    const users = await User.find({ _id: { $ne: req.user._id } }).lean();
    const frontendUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",")[0].trim();
    const plainMessage = `New event: ${name} on ${new Date(date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}. ${description || ""}`;

    const emailTasks = users
      .filter((u) => u.email)
      .map((u) => {
        const html = newEventEmail({
          userName: u.name,
          eventName: name,
          eventDate: date,
          description,
          registrationLink,
          viewUrl: `${frontendUrl}/events`,
        });
        return sendEmail(
          u.email,
          `New Event: ${name} | AVERA`,
          plainMessage,
          html,
        );
      });
    Promise.allSettled(emailTasks).catch(() => {});

    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};

export const listEvents = async (req, res, next) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    res.json({ events });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      throw createError(404, "Event not found");
    }
    res.json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
};
