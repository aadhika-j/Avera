import { Notification } from "../models/Notification.js";

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
};
