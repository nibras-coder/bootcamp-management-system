import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const isValidASTUEmail = (email) => {
    return /^[^\s@]+@astu\.edu\.et$/i.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidASTUEmail(email)) {
      setError("Please use your ASTU university email (@astu.edu.et).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
        role: "student",
      });

      setSuccess(
        response.data?.message ||
          "Registration successful! You can now log in."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Go to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      if (err.response?.status === 400) {
        setError(backendMessage || "Invalid registration information.");
      } else if (err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(
          backendMessage || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 px-8 py-10 md:px-12 lg:px-16 flex flex-col justify-center">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-14 h-14 object-contain"
            />

            <div>
              <h1 className="text-lg font-bold text-gray-800">
                ASTU MSJ
              </h1>

              <p className="text-xs text-gray-500">
                Bootcamp System
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Create Account
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Register using your ASTU university email
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                ASTU Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name4456@astu.edu.et"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

              <p className="text-xs text-gray-400 mt-1">
                Only @astu.edu.et emails are allowed.
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 pr-16 rounded-xl border border-gray-300 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-teal-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 pr-16 rounded-xl border border-gray-300 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-teal-700"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-800 hover:bg-teal-900 disabled:bg-teal-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition shadow-md"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-teal-700 font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 text-white relative overflow-hidden items-center justify-center p-12">

          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-white/5" />

          <div className="relative z-10 text-center max-w-sm">
              <div className="w-32 h-32 mx-auto mb-7 rounded-full overflow-hidden border-2 border-white/30 bg-white flex items-center justify-center">
                <img
                  src={logo}
                  alt="ASTU Muslim Students Jemea"
                  className="w-full h-full object-cover"
                />
              </div>

            <p
              className="text-4xl leading-relaxed font-serif mb-4"
              dir="rtl"
              lang="ar"
            >
              وَقُلْ رَبِّ زِدْنِي عِلْمًا
            </p>

            <p className="text-xs text-teal-200 mb-7">
              "And say: My Lord, increase me in knowledge."
            </p>

            <h3 className="text-2xl font-bold mb-3">
              Learn. Build. Grow.
            </h3>

            <p className="text-sm text-teal-100">
              Join the ASTU MSJ Bootcamp community.
            </p>

            <p className="text-xs text-teal-200 mt-6 tracking-wide">
              ASTU Muslim Students Jemea
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;