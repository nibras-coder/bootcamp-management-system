const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const transporter = require("../config/email");
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};
// Register only student

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      gender,
    } = req.body;

    console.log(`[REGISTER] Attempting to register email: ${email}`);

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !gender
    ) {
      console.log(`[REGISTER FAILED] Missing fields`);
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      console.log(`[REGISTER FAILED] Passwords do not match`);
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (!/^\S+@\S+\.\S+$/i.test(email.trim())) {
      console.log(`[REGISTER FAILED] Invalid email format: ${email}`);
      return res.status(400).json({
        message: "Please use a valid email address",
      });
    }

    if (password.length < 6) {
      console.log(`[REGISTER FAILED] Password too short`);
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      console.log(`[REGISTER FAILED] Email already registered: ${email}`);
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    console.log(`[REGISTER] Creating user in DB...`);
    // Public registration ALWAYS creates a student
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: "student",
      password: password,
      gender: gender,
    });
    console.log(`[REGISTER SUCCESS] User created with ID: ${user._id}`);

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Login — All Rolse

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

    if (!email || !password) {
      console.log(`[LOGIN FAILED] Missing email or password`);
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select("+password");

    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: ${email}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );
    console.log(`[LOGIN] Password match result: ${isPasswordCorrect}`);

    if (!isPasswordCorrect) {
      console.log(`[LOGIN FAILED] Incorrect password for email: ${email}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Elevate this specific user to admin if they aren't already
    if (user.email === "admin@gmail.com") {
      user.role = "admin";
      await User.updateOne({ _id: user._id }, { $set: { role: "admin" } });
    }

    const token = generateToken(user);
    console.log(`[LOGIN SUCCESS] Token generated for user: ${email}`);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // Don't reveal whether an email exists
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5174';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Bootcamp Management System - Password Reset",
        html: `
          <h2>Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password.</p>
          <p>Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:6px;">
            Reset Password
          </a>
          <p>This link expires in 15 minutes.</p>
          <p>If you didn't request this, you can ignore this email.</p>
        `,
      });

      res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (emailError) {
      console.error("FORGOT PASSWORD CRASH:", emailError);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        message: emailError.message || "Failed to process password reset",
      });
    }
  } catch (error) {
    console.error("FORGOT PASSWORD CRASH:", error);

    res.status(500).json({
      message: error.message || "Failed to process password reset",
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const {
      password,
      confirmPassword,
    } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message:
          "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    // Hash token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Reset token is invalid or has expired",
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};
module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};