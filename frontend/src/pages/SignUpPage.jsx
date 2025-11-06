import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, User, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const { signup, isSigningUp } = useAuthStore();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const navigate = useNavigate();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#101622] dark:to-[#1a1f2e] pt-16 transition-all duration-300 relative">
      {/* 🌙 Light/Dark Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 text-gray-500 dark:text-gray-300 hover:text-[#6B21A8] transition-colors"
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/*  Logo */}
<div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
  <img
    src="/logo.PNG"
    alt="SecureChat Logo"
    className="w-24 h-24 mb-3 drop-shadow-2xl"
  />
  <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-wide drop-shadow-md">
    SecureChat
  </h1>
</div>


      {/*  Signup Card */}
      <div className="w-full max-w-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 mt-10">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6B21A8] to-[#2b6cee] bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Join SecureChat today!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="label text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                className="input input-bordered w-full pl-12 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#6B21A8] transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="label text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full pl-12 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#6B21A8] transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="label text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="input input-bordered w-full pl-12 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#6B21A8] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn w-full mt-4 border-none bg-gradient-to-r from-[#6B21A8] to-[#2b6cee] hover:from-[#5B1B91] hover:to-[#2563eb] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            disabled={isSigningUp}
          >
            {isSigningUp ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline text-[#6B21A8] transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
