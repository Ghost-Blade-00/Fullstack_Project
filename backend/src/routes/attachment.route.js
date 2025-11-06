import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//  Ensure MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in environment variables");
}

//  Proper GridFS storage engine setup
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    const { contentHash } = req.query; // optional for deduplication
    return {
      filename: contentHash || `${Date.now()}-${file.originalname}`,
      bucketName: "attachments", // GridFS bucket name
      metadata: {
        uploader: req.user?._id?.toString() || "anonymous",
        originalName: file.originalname,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      },
    };
  },
});

//  Multer upload instance
const upload = multer({ storage });

//  Routes
router.post("/upload", protectRoute, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({
    fileId: req.file.id,
    filename: req.file.filename,
    bucketName: req.file.bucketName,
  });
});

router.get("/download/:filename", protectRoute, async (req, res) => {
  const conn = (await import("mongoose")).default.connection;
  const bucket = new conn.mongo.GridFSBucket(conn.db, { bucketName: "attachments" });
  const { filename } = req.params;

  const stream = bucket.openDownloadStreamByName(filename);
  stream.on("error", () => res.status(404).json({ message: "File not found" }));
  stream.pipe(res);
});

export default router;
