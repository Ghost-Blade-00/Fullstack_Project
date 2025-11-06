import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

//  Memory storage (not dest: "uploads/")
const upload = multer({ storage: multer.memoryStorage() });

router.post("/send/:id", authMiddleware, upload.single("image"), sendMessage);
router.get("/:id", authMiddleware, getMessages);

export default router;
