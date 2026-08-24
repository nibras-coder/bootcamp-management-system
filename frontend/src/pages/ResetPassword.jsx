import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import loginBg from "../assets/login-bg.jpg";
import calligraphy from "../assets/calligraphy.jpg";
import API from "../api/axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const response = await API.post(`/auth/reset-password/${token}`, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link might be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900">
      
      {/* Mobile Image (Top) */}
      <div className="block md:hidden w-full h-48 sm:h-64 relative">
        <img
          src={calligraphy}
          alt="Reset Password Background Mobile"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
      </div>

      {/* Image Half (Left) */}
      <div className="hidden md:block w-full md:w-1/2 relative">
        <img
          src={loginBg}
          alt="Reset Password Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
      </div>

      {/* Form Half (Right) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create new password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your new password must be different from previous used passwords.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="mt-8 space-y-6">
              <div className="p-4 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
                <h3 className="text-sm font-medium">Password reset successful</h3>
                <div className="mt-2 text-sm text-teal-700 dark:text-teal-400">
                  <p>You can now log in with your new password.</p>
                </div>
              </div>
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-70"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
