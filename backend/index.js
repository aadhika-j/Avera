import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cron from "node-cron";

import { connectDatabase } from "./config/db.js";
import { swaggerMiddleware } from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import internalComponentRoutes from "./routes/internalComponentRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { initSockets } from "./sockets/index.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*", credentials: true }));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/docs", ...swaggerMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/components", internalComponentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
const server = http.createServer(app);
initSockets(server);

// Schedule reminder jobs; placeholder cron to run every hour
cron.schedule("0 * * * *", () => {
  // TODO: implement reminder dispatch logic with Twilio/Nodemailer
});

const start = async () => {
  try {
    await connectDatabase(process.env.MONGO_URI);
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on port ${port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
