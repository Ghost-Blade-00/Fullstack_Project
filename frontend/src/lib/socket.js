import { io } from "socket.io-client";

// ✅ Point Socket.io to the correct backend (Render in production)
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001" // local dev server
    : "https://fullstack-project-k2zq.onrender.com"; // ✅ your Render backend URL

export const socket = io(BASE_URL, {
  withCredentials: true,
  transports: ["websocket"], // ensures WebSocket only (no polling fallback)
});

console.log("🔌 Connected to Socket.io at:", BASE_URL);
