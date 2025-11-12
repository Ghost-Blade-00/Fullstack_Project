import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * ✅ Authentication middleware
 * Verifies JWT token stored in cookies and attaches user to request.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // ✅ Read JWT token from cookies
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    // ✅ Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find user by ID
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // ✅ Attach user info to request
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

/**
 * ✅ Alias for backward compatibility
 * (some routes may import `protectRoute`)
 */
export const protectRoute = authMiddleware;
