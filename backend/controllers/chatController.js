import { ChatMessage } from "../models/ChatMessage.js";

export const listMessages = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "name role");
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

export const postMessage = async (req, res, next) => {
  try {
    const { content, replyTo, attachments } = req.body;
    const message = await ChatMessage.create({
      content,
      replyTo,
      attachments,
      sender: req.user._id,
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};
