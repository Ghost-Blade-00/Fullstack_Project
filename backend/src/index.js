import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { app, server } from "./lib/socket.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { v4 as uuid } from "uuid";
import { connectDB } from "./lib/db.js";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import deviceRoutes from "./routes/device.route.js";
import envelopeRoutes from "./routes/envelope.route.js";
import attachmentRoutes from "./routes/attachment.route.js";

// __dirname setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect MongoDB
connectDB();

// Middlewares
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://securechat.com",
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));

app.use((req, _res, next) => {
  req.id = uuid();
  next();
});

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "tiny"
      : ":method :url :status :res[content-length] - :response-time ms id=:req[id]"
  )
);

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 600 });

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);
app.use("/api/devices", apiLimiter, deviceRoutes);
app.use("/api/envelopes", apiLimiter, envelopeRoutes);
app.use("/api/attachments", apiLimiter, attachmentRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(frontendPath, "index.html"))
  );
}

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
