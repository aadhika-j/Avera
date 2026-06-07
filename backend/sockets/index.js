import { Server } from "socket.io";

let ioInstance;

export const initSockets = (httpServer) => {
  const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
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
