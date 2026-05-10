import "dotenv/config";
import express from "express";
import cors from "cors";

import config from "./config/index.js";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";

import uploadRoutes from "./routes/upload.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(logger);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ success: true, data: {}, message: "Server is running" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/upload", uploadRoutes);
app.use("/chat", chatRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "NotFound",
    message: "The requested resource does not exist",
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`);
});
