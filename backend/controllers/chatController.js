import { ChatMessage } from "../models/ChatMessage.js";
import { emitChatMessage, emitChatRead } from "../sockets/index.js";

export const listMessages = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "name role")
      .populate("readBy", "name");

    const unread = messages.filter(
      (m) => !m.readBy.some((u) => u._id.toString() === req.user._id.toString())
    );

    if (unread.length) {
      await ChatMessage.updateMany(
        { _id: { $in: unread.map((m) => m._id) } },
        { $addToSet: { readBy: req.user._id } }
      );

      unread.forEach((m) => {
        m.readBy.push({ _id: req.user._id, name: req.user.name });
      });

      emitChatRead({
        messageIds: unread.map((m) => m._id.toString()),
        userId: req.user._id.toString(),
      });
    }

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
      readBy: [req.user._id],
    });
    const populated = await message
      .populate("sender", "name role")
      .populate("readBy", "name");

    emitChatMessage(populated);
    res.status(201).json({ message: populated });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { messageIds } = req.body;
    const ids = Array.isArray(messageIds) ? messageIds : [];
    if (!ids.length) {
      return res.json({ updated: 0 });
    }

    const stringIds = ids.map((id) => id.toString());

    const result = await ChatMessage.updateMany(
      { _id: { $in: stringIds } },
      { $addToSet: { readBy: req.user._id } }
    );

    emitChatRead({ messageIds: stringIds, userId: req.user._id.toString() });
    res.json({ updated: result.modifiedCount || 0 });
  } catch (err) {
    next(err);
  }
};
