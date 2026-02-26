import createError from "http-errors";
import { Event } from "../models/Event.js";

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
