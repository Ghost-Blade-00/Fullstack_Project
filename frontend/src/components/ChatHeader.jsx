import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  //  Prevent crashes when data isn’t ready
  if (!selectedUser) {
    return (
      <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500">
        No chat selected
      </div>
    );
  }

  //  Use optional chaining to avoid undefined errors
  const isOnline = Array.isArray(onlineUsers) && onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName || "User"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className={`text-sm ${isOnline ? "text-green-500" : "text-neutral-500"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Close chat"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
