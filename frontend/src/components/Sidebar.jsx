import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Loading from "./Loading";

const Sidebar = () => {
  const { users, isUsersLoading, getUsers, setSelectedUser, selectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="h-full w-[400px] flex flex-col bg-white dark:bg-[#0B141A] border-r border-gray-200 dark:border-[#2A3942] text-gray-900 dark:text-gray-200 transition-colors duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-[#2A3942] font-bold text-xl tracking-wide">
        Chats
      </div>

      {isUsersLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {users.map((user) => {
            const isOnline = onlineUsers?.includes(user._id);

            return (
              <li
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                  selectedUser?._id === user._id
                    ? "bg-gradient-to-r from-[#6B21A8] to-[#9333EA] text-white"
                    : "hover:bg-gray-100 dark:hover:bg-[#202C33]"
                }`}
              >
                {/* Profile picture */}
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full shadow-md"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#0B141A] ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>

                <div className="flex flex-col">
                  <span
                    className={`font-semibold ${
                      selectedUser?._id === user._id
                        ? "text-white"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {user.fullName}
                  </span>
                  <span
                    className={`text-sm ${
                      selectedUser?._id === user._id
                        ? "text-purple-200"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
