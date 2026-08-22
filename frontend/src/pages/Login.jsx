import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import calligraphy from "../assets/calligraphy.jpg";
import logo from "../assets/logo.png";
import API from "../api/axios";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

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
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-main">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">
            Log in to continue your bootcamp journey.
          </p>

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
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </form>
        </div>

        <div className="auth-art">
          <img src={calligraphy} alt="" />
          <div className="art-overlay"></div>
          <div className="auth-brand">
            <Link to="/" className="logo">
              <img src={logo} alt="ASTU MSJ logo" />
              <span>
                ASTU MSJ <b>Bootcamp</b>
              </span>
            </Link>
            <Link to="/" className="auth-home-hint">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
