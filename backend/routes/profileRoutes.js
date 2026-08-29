const express = require("express");

const {
  getMyProfile,
  updateProfilePhoto,
  updateMyProfile,
  updatePassword,
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

// Update logged-in user's profile
router.put(
  "/",
  protect,
  updateMyProfile
);

router.patch(
  "/",
  protect,
  updateMyProfile
);

// Change logged-in user's profile photo
router.patch(
  "/photo",
  protect,
  updateProfilePhoto
);

// Update password
router.put(
  "/password",
  protect,
  updatePassword
);

module.exports = router;