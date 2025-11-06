import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center animate-bounce">
            <MessageSquare className="w-8 h-8 text-indigo-600 " />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Welcome to SecureChat!</h2>
        <p className="text-neutral-500 dark:text-neutral-400">Select a conversation from the sidebar to start chatting</p>
      </div>
    </div>
  );
};

export default NoChatSelected;
