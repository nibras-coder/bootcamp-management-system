import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Button from "../components/Button";
import logo from "../assets/logo.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", formData);

      if (response.data.token) {
        // 1. Save BOTH the token and the user data
        localStorage.setItem("token", response.data.token);

        // Ensure we actually have user data before saving it to avoid JSON errors
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // 2. Redirect them to the correct dashboard based on their role
        if (response.data.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          // Send students and mentors to the standard dashboard
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex w-full max-w-4xl">
        {/* Left Form Panel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-3">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800">ASTU MSJ</h1>
              <p className="text-xs text-gray-500">Bootcamp System</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Welcome Back!
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Login to continue to your account
          </p>

          {error && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Remember me
              </label>
              <a href="#forgot" className="text-teal-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-teal-600 font-medium hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Right Calligraphy & Branding Panel */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-700 to-teal-900 text-white p-8 flex-col items-center justify-center text-center">
          <div className="w-28 h-28 mb-6 rounded-full overflow-hidden border-2 border-white/30 bg-white flex items-center justify-center p-0.002">
            <img
              src={logo}
              alt="ASTU MSJ Calligraphy"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h3 className="text-xl font-bold mb-2">
            Empowering Future Developers
          </h3>
          <p className="text-xs text-teal-200">Learn. Build. Grow.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
