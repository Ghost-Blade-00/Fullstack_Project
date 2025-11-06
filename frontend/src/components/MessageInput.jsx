import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { selectedUser, getMessages } = useChatStore();

  //  Handle file selection + show preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  //  Handle send (text or image)
  const handleSend = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];

    if (!message.trim() && !file) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      if (message.trim()) formData.append("text", message);
      if (file) formData.append("image", file);

      console.log("🚀 Sending to:", `/messages/send/${selectedUser._id}`);

      //  FIXED: Removed manual Content-Type header
      await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        {
          withCredentials: true, // keep this
        }
      );

      setMessage("");
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      getMessages(selectedUser._id);
    } catch (error) {
      console.error("❌ Message send error:", error);
      toast.error(error.response?.data?.message || "Internal server error");
    } finally {
      setIsSending(false);
    }
  };

  //  Opens file dialog
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  return (
    <form onSubmit={handleSend} className="flex flex-col gap-2">
      {/* Image preview (only if image selected) */}
      {preview && (
        <div className="relative self-start mb-1">
          <img
            src={preview}
            alt="preview"
            className="w-20 h-20 rounded-lg object-cover border border-gray-600"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/*  Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/*  Input row (unchanged as you requested) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAttachClick}
          className="p-2 text-gray-400 hover:text-[#9333EA] transition-colors"
        >
          <Paperclip className="w-6 h-6" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message ${selectedUser?.fullName}...`}
          className="flex-1 bg-[#2a3942] text-gray-200 placeholder-gray-400 rounded-full px-4 py-2 outline-none"
        />

        <button
          type="submit"
          disabled={isSending}
          className="p-2 bg-gradient-to-r from-[#6B21A8] to-[#9333EA] rounded-full text-white hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
