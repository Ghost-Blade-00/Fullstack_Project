import { Server } from "socket.io";
import http from "http";
import express from "express";

export const app = express();
export const server = http.createServer(app);

const userSocketMap = new Map(); // userId -> socket.id

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
//  Utility to get receiver's socket ID
export const getReceiverSocketId = (userId) => {
  return userSocketMap.get(userId);
};

//  Handle socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`🟢 User connected: ${userId} (${socket.id})`);
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys())); // Broadcast updated list
  }

  socket.on("disconnect", () => {
    if (userId) {
      userSocketMap.delete(userId);
      console.log(`🔴 User disconnected: ${userId}`);
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys())); // Broadcast updated list
    }
  });
});
