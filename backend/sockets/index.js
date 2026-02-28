import { Server } from "socket.io";

let ioInstance;

export const initSockets = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("chat:read", (payload) => {
      if (!payload?.messageIds || !Array.isArray(payload.messageIds)) return;
      if (!payload.userId) return;
      ioInstance.emit("chat:read", payload);
    });
  });

  return ioInstance;
};

export const emitChatMessage = (message) => {
  if (ioInstance) {
    ioInstance.emit("chat:new", message);
  }
};

export const emitChatRead = (payload) => {
  if (ioInstance) {
    ioInstance.emit("chat:read", payload);
  }
};
