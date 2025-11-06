import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?._id;
    const receiverId = req.params.id;
    const { text } = req.body;

    console.log("🟢 Incoming message request:");
    console.log("Sender:", senderId);
    console.log("Receiver:", receiverId);
    console.log("Text:", text || "(none)");
    console.log("File received:", !!req.file);

    let imageUrl = null;

    //  Upload image if present
    if (req.file) {
      try {
        const base64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${base64}`;

        console.log("🟡 Uploading image to Cloudinary...");

        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: "securechat_messages",
        });

        console.log("✅ Cloudinary upload success:", uploadResult.secure_url);
        imageUrl = uploadResult.secure_url;
      } catch (cloudErr) {
        console.error("💥 Cloudinary upload failed:", cloudErr.message);
        return res
          .status(500)
          .json({ message: "Failed to upload image to Cloudinary" });
      }
    }

    //  Validate
    if (!text?.trim() && !imageUrl) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    //  Check receiver existence
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    //  Save message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl || null,
    });

    console.log("💾 Message saved:", newMessage._id);

    //  Emit real-time event via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log("📡 Emitting message to:", receiverSocketId);
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("💥 sendMessage error:", err);
    res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

// Get chat messages
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user?._id;
    const receiverId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("💥 getMessages error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
