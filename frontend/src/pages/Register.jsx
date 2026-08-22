import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import calligraphy from "../assets/calligraphy.jpg";
import logo from "../assets/logo.png";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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
    return /^[^\s@]+@gmail\.com$/i.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const role = formData.role;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidASTUEmail(email)) {
      setError("Please use a valid email.");
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
        confirmPassword,
        role,
        track: formData.track,
      });

      setSuccess(
        response.data?.message ||
          "Registration successful! You can now log in.",
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        track: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      if (err.response?.status === 400) {
        setError(backendMessage || "Invalid registration information.");
      } else if (err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(backendMessage || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-main">
          <h1>Create your account</h1>

          <p className="auth-subtitle">
            Join the bootcamp today and start your journey.
          </p>

          {/* Error and Success Messages */}
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
          {success && (
            <div
              style={{
                color: "#16a34a",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </label>

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
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
            </label>

            <label className="field">
              <span>Choose Track</span>
              <select
                name="track"
                required
                value={formData.track || ""}
                onChange={handleChange}
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  width: "100%",
                }}
              >
                <option value="" disabled>
                  Select a track
                </option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Data Science">Data Science</option>
              </select>
            </label>

            <label className="terms">
              <input type="checkbox" required />
              <span>
                I agree to the Terms and Conditions-
                <Link
                  to="/terms"
                  className="text-teal-600 hover:text-teal-800 font-semibold transition-colors"
                >
                  Read Terms
                </Link>
              </span>
            </label>

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login" className="link-button">
                Login here
              </Link>
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

export default Register;
