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

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import deviceRoutes from "./routes/device.route.js";
import envelopeRoutes from "./routes/envelope.route.js";
import attachmentRoutes from "./routes/attachment.route.js";

// ✅ Connect MongoDB
connectDB();

// ✅ Middlewares
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));

app.use((req, _res, next) => {
  req.id = uuid();
  next();
});

app.use(morgan(":method :url :status :res[content-length] - :response-time ms id=:req[id]"));

// ✅ Rate Limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 600 });

// ✅ Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);
app.use("/api/devices", apiLimiter, deviceRoutes);
app.use("/api/envelopes", apiLimiter, envelopeRoutes);
app.use("/api/attachments", apiLimiter, attachmentRoutes);

// ✅ Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

//  Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
