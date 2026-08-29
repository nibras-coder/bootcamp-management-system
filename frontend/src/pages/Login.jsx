import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import loginBg from "../assets/login-bg.jpg";
import loginMobileBg from "../assets/image_mobile.png";
import calligraphy from "../assets/calligraphy.jpg";
import logo from "../assets/logo.png";
import API from "../api/axios";
import PWAInstallButton from "../components/PWAInstallButton";
function Login() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", formData);
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "mentor") navigate("/mentor-dashboard");
      else navigate("/student-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PWAInstallButton />
      <main className="min-h-[100dvh] overflow-y-auto flex flex-col md:flex-row bg-white dark:bg-gray-900">

      {/* Mobile Image (Visible only on < 768px) */}
      <div className="w-full h-48 block md:hidden relative order-first">
        <img
          src={loginMobileBg}
          alt="Login Background Mobile"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
      </div>

      {/* Desktop Image Half (Visible only on >= 768px) */}
      <div className="hidden md:block w-full md:w-1/2 relative order-first">
        <img
          src={loginBg}
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover md:object-center"
        />
        <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
      </div>

      {/* Form Half (Right) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 pb-24 sm:p-12 md:pb-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center md:text-left">

            <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-400">Log in to continue your bootcamp journey.</p>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" 
                />
                <label className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-teal-600 dark:text-teal-400 hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>

    </main>
    </>
  );
}

export default Login;
