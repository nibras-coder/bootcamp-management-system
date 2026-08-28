import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import loginBg from "../assets/login-bg.jpg";
import calligraphy from "../assets/calligraphy.jpg";
import API from "../api/axios";

function ForgotPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900">
      
      {/* Mobile Image (Top) */}
      <div className="block md:hidden w-full h-48 sm:h-64 relative">
        <img
          src={calligraphy}
          alt="Forgot Password Background Mobile"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-teal-900/20 mix-blend-multiply" />
      </div>

      {/* Image Half (Left) */}
      <div className="hidden md:block w-full md:w-1/2 relative">
        <img
          src={loginBg}
          alt="Forgot Password Background"
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
              {sent ? "Check your inbox" : "Forgot your password?"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {sent 
                ? "If an account exists for that email, a reset link is on its way." 
                : "Enter the email you registered with and we will send you a reset link."}
            </p>
          </div>

          {sent ? (
            <div className="mt-8 space-y-6">
              <div className="p-4 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
                <h3 className="text-sm font-medium">Reset link sent</h3>
                <div className="mt-2 text-sm text-teal-700 dark:text-teal-400">
                  <p>We sent instructions to <b>{email}</b>. Check your inbox and spam folder.</p>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Back to login
                </Link>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <form 
              className="mt-8 space-y-6" 
              onSubmit={async (e) => {
                e.preventDefault();
                if (email.trim()) {
                  try {
                    await API.post("/auth/forgot-password", { email });
                    setSent(true);
                  } catch (err) {
                    console.error("Forgot password error", err);
                    setSent(true); // Don't leak whether email exists or not
                  }
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                Send reset link
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Remembered it?{" "}
                <Link to="/login" className="font-medium text-teal-600 dark:text-teal-400 hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default ForgotPage;
