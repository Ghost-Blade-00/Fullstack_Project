import express from "express";
import multer from "multer";
import {
  signup,
  login,
  logout,
  checkAuth,
  getAllUsers,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//  Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", authMiddleware, checkAuth);
router.get("/users", authMiddleware, getAllUsers);

//  Profile update (new working route)
router.put("/update-profile", authMiddleware, upload.single("profilePic"), updateProfile);

export default router;
