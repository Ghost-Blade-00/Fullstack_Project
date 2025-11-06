import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Settings, LogOut, User, LogIn } from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-[#0B0F19] border-b border-gray-200 dark:border-[#1F2937] text-gray-900 dark:text-white z-50 shadow-md transition-colors duration-300">
      <div className="w-full max-w-[95%] mx-auto px-8 py-3 flex justify-between items-center">
        {/*  Logo + App Name */}
        <Link
          to="/"
          className="flex items-center gap-3 group cursor-pointer select-none"
        >
          <img
            src="/logo.PNG"
            alt="SecureChat Logo"
            className="w-10 h-10 object-contain rounded-md transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] bg-clip-text text-transparent">
            SecureChat
          </span>
        </Link>

        {/*  Buttons */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1E293B] text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-[#334155] hover:text-[#6B21A8] transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>

          {authUser ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1E293B] text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-[#334155] hover:text-[#6B21A8] transition-all duration-200"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-600/30 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1E293B] text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-[#334155] hover:text-[#6B21A8] transition-all duration-200"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#6B21A8] to-[#9333EA] text-white hover:from-[#581C87] hover:to-[#7E22CE] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <User className="w-5 h-5" />
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
