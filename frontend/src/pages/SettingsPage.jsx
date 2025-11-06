import { useThemeStore } from "../store/useThemeStore";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  //  Apply theme globally with smooth transition
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);

    document.body.style.transition = "background-color 0.4s ease, color 0.4s ease";
    document.body.style.backgroundColor =
      theme === "dark" ? "#0f172a" : "#f9fafb";
    document.body.style.color = theme === "dark" ? "#e5e7eb" : "#1f2937";
  }, [theme]);

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20 max-w-5xl transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else navigate("/login");
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Theme section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-sm text-base-content/70">
              Switch between Light and Dark
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`btn btn-sm ${
                theme === "light" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setTheme("light")}
            >
              <Sun className="w-4 h-4 mr-2" /> Light
            </button>
            <button
              className={`btn btn-sm ${
                theme === "dark" ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setTheme("dark")}
            >
              <Moon className="w-4 h-4 mr-2" /> Dark
            </button>
          </div>
        </div>

        {/* Live preview */}
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg transition-all duration-500">
          <div className="p-4 bg-base-200">
            <div className="max-w-lg mx-auto">
              <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">John Doe</h3>
                      <p className="text-xs text-base-content/70">Online</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4 min-h-[200px] bg-base-100">
                  <div className="flex">
                    <div className="max-w-[80%] rounded-2xl px-3.5 py-2 bg-base-200 border border-base-300">
                      <p className="text-sm">Design preview message</p>
                      <p className="text-[10px] text-base-content/60 mt-1 text-right">
                        12:00
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-base-300 bg-base-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1 text-sm h-10 bg-base-200 text-base-content placeholder:text-base-content/50"
                      placeholder="Type a message..."
                      readOnly
                    />
                    <button className="btn btn-primary h-10 min-h-0" type="button">
                      Send
                    </button>
                  </div>
                </div>

                {/* About section */}
                <div className="border-t border-gray-300 dark:border-gray-700 pt-6 px-4 pb-4 transition-colors duration-500">
                  <h2 className="text-lg font-semibold mb-2">About SecureChat</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    SecureChat is an end-to-end encrypted messaging platform designed
                    for privacy, speed, and simplicity. Built with cutting-edge
                    encryption and real-time communication powered by Socket.IO and
                    MongoDB.
                  </p>
                  <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                    Version 1.0.0 — All rights reserved © 2025 SecureChat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
