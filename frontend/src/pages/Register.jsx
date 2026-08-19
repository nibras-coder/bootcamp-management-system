import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import calligraphy from "../assets/calligraphy.jpg";
import logo from "../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-page">
      <div className="auth-shell">

        <div className="auth-main">
          <h1>Create your account</h1>

          <p className="auth-subtitle">
            Join the bootcamp today and start your journey.
          </p>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();

              // We will connect registration to the backend later.
              console.log("Registration submitted");
            }}
          >
            <label className="field">
              <span>Full name</span>

              <input
                type="text"
                required
                placeholder="Enter your full name"
              />
            </label>

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
                  placeholder="Create a password"
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

            <label className="field">
              <span>Confirm password</span>

              <input
                type="password"
                required
                placeholder="Confirm your password"
              />
            </label>

            <label className="field">
              <span>Role</span>

              <select required defaultValue="">
                <option value="" disabled>
                  Select your role
                </option>

                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
            </label>

            <label className="terms">
              <input type="checkbox" required />

              <span>
                I agree to the Terms and Conditions
              </span>
            </label>

            <button
              className="btn primary"
              type="submit"
            >
              Register
            </button>

            <p className="auth-switch">
              Already have an account?{" "}

              <button
                type="button"
                className="link-button"
                onClick={() => navigate("/login")}
              >
                Login here
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

export default Register;