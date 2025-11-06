import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";
import Loading from "./Loading";

const ChatContainer = () => {
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser)
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#101622] text-gray-600 dark:text-gray-300 transition-colors duration-300">
        Select a chat to start messaging
      </div>
    );

  // FIX: Dynamically check online status from socket users
  const isUserOnline = onlineUsers?.includes(selectedUser._id);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#101622] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-[#1A1F2E] border-b border-gray-200 dark:border-[#2A3942]">
        <img
          src={selectedUser.profilePic || "/avatar.png"}
          alt={selectedUser.fullName}
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600"
        />
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {selectedUser.fullName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isUserOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-10">
            No messages yet
          </p>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === authUser._id;
            return (
              <div
                key={idx}
                className={`flex my-1 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[70%] px-4 py-2 rounded-xl text-sm leading-relaxed ${
                    isOwn
                      ? "bg-gradient-to-r from-[#6B21A8] to-[#9333EA] text-white rounded-tr-none"
                      : "bg-gray-200 dark:bg-[#2A3942] text-gray-900 dark:text-gray-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isOwn
                        ? "text-purple-200/80"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-100 dark:bg-[#1A1F2E] border-t border-gray-200 dark:border-[#2A3942] p-3">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
