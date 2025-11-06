import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js"; // ✅ Added import

//  Generate JWT token & store in cookies
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

//  Signup
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    });

    generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  Logout
export const logout = async (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully" });
};

// Check authentication
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("CheckAuth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update profile (profile picture or name)
export const updateProfile = async (req, res) => {
  try {
    console.log("🟢 Received profile update request");
    console.log("File:", req.file ? req.file.originalname : "No file");
    console.log("User:", req.user?._id);

    const userId = req.user._id;
    const { fullName } = req.body;
    let profilePicUrl = "";

    //  Check file
    if (!req.file) {
      console.warn("⚠️ No file received in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("🟢 Uploading image to Cloudinary...");

    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "securechat_profiles",
    });

    console.log("✅ Cloudinary upload successful:", result.secure_url);

    profilePicUrl = result.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(fullName && { fullName }),
        ...(profilePicUrl && { profilePic: profilePicUrl }),
      },
      { new: true }
    ).select("-password");

    console.log("✅ Updated user:", updatedUser);

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Profile update failed", error: err.message });
  }
};


//  Get all users (for chat sidebar)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "_id fullName email profilePic"
    );
    res.json(users);
  } catch (error) {
    console.error("GetAllUsers error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
