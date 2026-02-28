import createError from "http-errors";
import { InternalComponent } from "../models/InternalComponent.js";
import { Subject } from "../models/Subject.js";
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
    // Fire-and-forget notifications to subject's students (placeholder: assumes phone/email on req.user for demo)
    const message = `New ${type} assigned for ${subject.name} due ${new Date(deadline).toLocaleString()}`;
    if (req.user?.phoneNumber) sendSms(req.user.phoneNumber, message).catch(() => {});
    if (req.user?.whatsappNumber) sendWhatsapp(req.user.whatsappNumber, message).catch(() => {});
    if (req.user?.email) sendEmail(req.user.email, "New assignment", message).catch(() => {});

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
