const express = require("express");

const {
  getMyProfile,
  updateProfilePhoto,
} = require("../controllers/profileController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get(
  "/",
  protect,
  getMyProfile
);

// Change logged-in user's profile photo
router.patch(
  "/photo",
  protect,
  updateProfilePhoto
);

module.exports = router;