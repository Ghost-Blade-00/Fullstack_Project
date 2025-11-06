import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

// ✅ Welcome Page Component
const Welcome = () => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-100 pt-16 transition-colors duration-500">
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-[#6B21A8] to-[#2563EB] bg-clip-text">
        Welcome to SecureChat
      </h1>
      <p className="text-base-content/70 text-lg">
        Chat securely, connect freely — log in or create an account to get started.
      </p>
    </div>
  </div>
);

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();

  // ✅ Run authentication check on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ Apply and persist theme globally (runs on first load + on toggle)
  useEffect(() => {
    // Apply stored or current theme
    const savedTheme = localStorage.getItem("theme") || theme;
    setTheme(savedTheme);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    document.body.style.transition = "background-color 0.4s ease, color 0.4s ease";
    document.body.style.backgroundColor =
      savedTheme === "dark" ? "#0f172a" : "#f9fafb";
    document.body.style.color =
      savedTheme === "dark" ? "#e5e7eb" : "#1f2937";
  }, [theme, setTheme]);

  // ✅ While checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100 transition-colors duration-500">
        <Loader className="size-10 animate-spin text-[#6B21A8]" />
      </div>
    );
  }

  // ✅ Hide Navbar on login/signup routes
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {!hideNavbar && <Navbar />}

      <main className="pt-16 transition-all duration-500">
        <Routes>
          {/* Redirect root based on auth status */}
          <Route
            path="/"
            element={
              authUser ? (
                <Navigate to="/chat" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Auth routes */}
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/chat" replace />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/chat" replace />}
          />

          {/* Protected pages */}
          <Route
            path="/chat"
            element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings"
            element={authUser ? <SettingsPage /> : <Navigate to="/login" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ✅ Toast messages adapt to theme */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1e293b" : "#ffffff",
            color: theme === "dark" ? "#e5e7eb" : "#1f2937",
            border:
              theme === "dark"
                ? "1px solid #334155"
                : "1px solid #e5e7eb",
          },
        }}
      />
    </div>
  );
};

export default App;
