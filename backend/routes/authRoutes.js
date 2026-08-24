const express = require("express");

const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();


// PUBLIC AUTH ROUTES


router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);


// PROTECTED AUTH ROUTES


// Get currently logged-in user
router.get("/me", protect, getMe);

// Change password
router.put(
  "/change-password",
  protect,
  changePassword
);

module.exports = router;