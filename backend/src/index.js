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

// ✅ Security Middleware
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ✅ Allow frontend domains
const allowedOrigins = [
  "http://localhost:5173",
  "https://fullstack-project-pyw4.vercel.app", // main Vercel domain
];

// ✅ Flexible CORS Setup for Render + Vercel Preview
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow Postman/curl
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") // ✅ Allow all preview domains
      ) {
        return callback(null, true);
      }
      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // ✅ allow sending cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ JSON + Cookie parser
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));

// ✅ Add unique request ID
app.use((req, _res, next) => {
  req.id = uuid();
  next();
});

// ✅ Logger
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms id=:req[id]")
);

// ✅ Rate Limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 600 });

// ✅ Health Routes
app.get("/", (_req, res) => res.send("✅ SecureChat backend is live and running!"));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ✅ Mount Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);
app.use("/api/devices", apiLimiter, deviceRoutes);
app.use("/api/envelopes", apiLimiter, envelopeRoutes);
app.use("/api/attachments", apiLimiter, attachmentRoutes);

// ✅ Global Error Handler
app.use((err, req, res, _next) => {
  console.error("❌ Server error:", err.message);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked - unauthorized origin" });
  }
  res.status(500).json({ message: "Internal server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
