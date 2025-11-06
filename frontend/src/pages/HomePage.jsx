import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d1117] text-white">
      {/* 🔹 Navbar occupies top 64px (16 * 4 = 64px) */}
      <div className="flex-1 flex pt-16 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-[#111827] border-r border-gray-800 overflow-y-auto">
          <Sidebar />
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#0d1117] overflow-hidden">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
