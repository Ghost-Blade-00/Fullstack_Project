import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: false,

  //  Setter (fixes "setAuthUser is not a function")
  setAuthUser: (user) => set({ authUser: user }),

  //  Connect Socket (after login)
connectSocket: (userId) => {
  if (!userId) return;

  const backendUrl =
    import.meta.env.MODE === "development"
      ? "http://localhost:5001"
      :"https://securechat.onrender.com";

  const socket = io(backendUrl, {
    query: { userId },
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
  socket.on("getOnlineUsers", (users) => set({ onlineUsers: users }));
  socket.on("disconnect", () => set({ onlineUsers: [] }));

  set({ socket });
},


  //  Disconnect socket on logout
  disconnectSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.disconnect();
      console.log("🔌 Socket closed manually");
      set({ socket: null, onlineUsers: [] });
    }
  },

  //  Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data, { withCredentials: true });
      set({ authUser: res.data });
      useAuthStore.getState().connectSocket(res.data._id);
      toast.success("Account created successfully!");
    } catch (err) {
      console.error("❌ Signup error:", err);
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  //  Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data, { withCredentials: true });
      set({ authUser: res.data });
      useAuthStore.getState().connectSocket(res.data._id);
      toast.success("Logged in successfully!");
    } catch (err) {
      console.error("❌ Login error:", err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      useAuthStore.getState().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("❌ Logout error:", err);
      toast.error("Logout failed");
    }
  },

  //  Check authentication (on page refresh)
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check", { withCredentials: true });
      if (res.data?._id) {
        set({ authUser: res.data });
        useAuthStore.getState().connectSocket(res.data._id);
        console.log("✅ Auth check passed:", res.data.fullName);
      } else {
        set({ authUser: null });
      }
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));
