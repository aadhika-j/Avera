import { Server } from "socket.io";
import { ChatMessage } from "../models/ChatMessage.js";

export const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("chat:send", async (payload) => {
      const message = await ChatMessage.create({
        content: payload.content,
        sender: payload.userId,
        replyTo: payload.replyTo,
        attachments: payload.attachments,
      });
      io.emit("chat:new", message);
    });
  });

  return io;
};
