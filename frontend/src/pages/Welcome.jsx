import { useThemeStore } from "./store/useThemeStore"; // Adjust path as needed
import { Moon, Sun, MessageSquare } from "lucide-react";

export default function Welcome() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className={`font-sans min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#101622] dark:to-[#1a1f2e] text-gray-800 dark:text-gray-200 transition-all duration-300`}>
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 text-[#2b6cee] animate-pulse">
              <MessageSquare fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">SecureChat</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <a className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#2b6cee] transition-colors" href="#">Learn More</a>
            <a href="/login" className="flex items-center justify-center rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-white text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-md">Log In</a>
          </div>
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white bg-gradient-to-r from-[#2b6cee] to-[#6b21a8] bg-clip-text text-transparent animate-fade-in">
              Private Conversations, Secured.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Experience true privacy with our state-of-the-art end-to-end encryption. Your messages are for your eyes only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
              <a href="/signup" className="flex w-full sm:w-auto min-w-[160px] items-center justify-center rounded-lg h-12 px-6 bg-gradient-to-r from-[#2b6cee] to-[#6b21a8] text-white text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                Create Account
              </a>
              <a href="/login" className="flex w-full sm:w-auto min-w-[160px] items-center justify-center rounded-lg h-12 px-6 bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-white text-base font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-md">
                Log In
              </a>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 w-full max-w-lg mx-auto">
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-[#101622]/70 p-6 text-left shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-full bg-gradient-to-r from-[#2b6cee] to-[#6b21a8] text-white shadow-md">
                  <span className="material-symbols-outlined !text-2xl">lock</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">End-to-End Encrypted</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                Only you and the person you're communicating with can read what's sent. No one in between, not even us, can access your messages.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 SecureChat. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#2b6cee] transition-colors" href="#">Terms of Service</a>
            <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#2b6cee] transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#2b6cee] transition-colors" href="#">About Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}