import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/auth/users", { withCredentials: true });
      set({ users: res.data });
    } catch (err) {
      console.error("getUsers error:", err?.response?.status, err?.response?.data);
      toast.error(err?.response?.data?.message || "Error loading users");
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, { withCredentials: true });
      set({ messages: res.data });
    } catch (err) {
      console.error("getMessages error:", err?.response?.status, err?.response?.data);
      toast.error(err?.response?.data?.message || "Error loading messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

sendMessage: async (text) => {
  const { selectedUser, messages } = get();
  if (!selectedUser) return toast.error("No user selected");

  try {
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`, // ✅ includes “send/”
      { text },
      { withCredentials: true }
    );
    set({ messages: [...messages, res.data] });
  } catch (err) {
    console.error("Message send error:", err);
    toast.error(err.response?.data?.message || "Error sending message");
  }
},


  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages } = get();
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        set({ messages: [...messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, messages: [] }),
}));
