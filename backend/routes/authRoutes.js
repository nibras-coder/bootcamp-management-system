const express = require("express");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

// ======================================================
// REGISTER
// ======================================================

router.post("/register", register);

// ======================================================
// LOGIN
// ======================================================

router.post("/login", login);

// ======================================================
// CURRENT LOGGED-IN USER
// IMPORTANT: /me MUST COME BEFORE /:id
// ======================================================

router.get("/me", protect, getMe);

// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post("/forgot-password", forgotPassword);

// ======================================================
// RESET PASSWORD
// ======================================================

router.post("/reset-password", resetPassword);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;