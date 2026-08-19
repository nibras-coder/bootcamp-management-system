import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import calligraphy from "../assets/calligraphy.jpg";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-page">
      <div className="auth-shell">

        <div className="auth-main">
          <h1>Welcome back</h1>

          <p className="auth-subtitle">
            Log in to continue your bootcamp journey.
          </p>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();

              // We will connect this to the backend later.
              console.log("Login submitted");
            }}
          >
            <label className="field">
              <span>Email</span>

              <input
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <label className="field">
              <span>Password</span>

              <div className="password">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
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

            <button className="btn primary" type="submit">
              Login
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
          <img
            src={calligraphy}
            alt=""
          />

          <div className="art-overlay"></div>

          <div className="auth-brand">
            <button
              className="logo"
              type="button"
              onClick={() => navigate("/")}
            >
              <img
                src={logo}
                alt="ASTU MSJ logo"
              />

              <span>
                ASTU MSJ <b>Bootcamp</b>
              </span>
            </button>

            <span className="auth-home-hint">
              Back to home
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Login;