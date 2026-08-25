import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import calligraphy from "../assets/calligraphy.jpg";
import logo from "../assets/logo.png";
import API from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      // Debug login response
      console.log("LOGIN RESPONSE:", data);

      /*
       * Support different possible backend response formats.
       * Normally your backend should return data.token,
       * but this also checks data.data.token.
       */
      const token =
        data?.token ||
        data?.data?.token ||
        data?.accessToken ||
        data?.data?.accessToken;

      const user =
        data?.user ||
        data?.data?.user;

      // Make sure the backend actually returned a token
      if (!token) {
        console.error("No token received from backend:", data);

        setError(
          "Login succeeded, but no authentication token was received."
        );

        return;
      }

      // Make sure user information exists
      if (!user) {
        console.error("No user information received:", data);

        setError(
          "Login succeeded, but user information was not received."
        );

        return;
      }

      // Save authentication information
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Token saved:", !!localStorage.getItem("token"));
      console.log("Logged-in user:", user);

      // Redirect based on role
      const role = user.role;

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "mentor") {
        // New mentor route
        navigate("/mentor");
      } else if (role === "student") {
        navigate("/student-dashboard");
      } else {
        console.warn("Unknown user role:", role);
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your email and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">

        {/* =========================
            LOGIN FORM
        ========================== */}
        <div className="auth-main">

          <h1>Welcome back</h1>

          <p className="auth-subtitle">
            Log in to continue your bootcamp journey.
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                color: "#dc2626",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* =========================
                EMAIL
            ========================== */}
            <label className="field">
              <span>Email</span>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                autoComplete="email"
              />
            </label>

            {/* =========================
                PASSWORD
            ========================== */}
            <label className="field">
              <span>Password</span>

              <div className="password">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </label>

            {/* =========================
                OPTIONS
            ========================== */}
            <div className="form-options">

              <label>
                <input
                  type="checkbox"
                  name="remember"
                />

                Remember me
              </label>

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  navigate("/forgot-password")
                }
              >
                Forgot password?
              </button>

            </div>

            {/* =========================
                LOGIN BUTTON
            ========================== */}
            <button
              className="btn primary"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

            {/* =========================
                REGISTER
            ========================== */}
            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">
                Create one
              </Link>
            </p>

          </form>
        </div>

        {/* =========================
            RIGHT SIDE IMAGE
        ========================== */}
        <div className="auth-art">

          <img
            src={calligraphy}
            alt="Calligraphy"
            className="w-full h-full object-cover object-center"
          />

          <div className="art-overlay"></div>

          <div className="auth-brand">

            <Link
              to="/"
              className="logo"
            >
              <img
                src={logo}
                alt="ASTU MSJ logo"
              />

              <span>
                ASTU MSJ <b>Bootcamp</b>
              </span>
            </Link>

            <Link
              to="/"
              className="auth-home-hint"
            >
              Back to home
            </Link>

          </div>
        </div>

      </div>
    </main>
  );
}

export default Login;