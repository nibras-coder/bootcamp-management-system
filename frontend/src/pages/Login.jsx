import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import calligraphy from "../assets/calligraphy.jpg";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const response = await API.post("/auth/login", formData);

      if (response.data.token) {
        // Save token and user data
        localStorage.setItem("token", response.data.token);

        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // Redirect based on role
        if (response.data.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
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
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-main">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">
            Log in to continue your bootcamp journey.
          </p>

          {/* Error Message */}
          {error && (
            <div
              style={{
                color: "#dc2626",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="form-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="text-button"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="auth-switch">
              Don't have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => navigate("/register")}
              >
                Register here
              </button>
            </p>
          </form>
        </div>

        <div className="auth-art">
          <img src={calligraphy} alt="Calligraphy Art" />
          <div className="art-overlay"></div>
          <div className="auth-brand">
            <button
              className="logo"
              type="button"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="ASTU MSJ logo" />
              <span>
                ASTU MSJ <b>Bootcamp</b>
              </span>
            </button>
            <span className="auth-home-hint">Back to home</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
