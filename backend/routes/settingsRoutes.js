const express = require("express");

const {
  getMySettings,
  updateMySettings,
} = require("../controllers/settingsController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get settings
router.get(
  "/",
  protect,
  getMySettings
);

// Update settings
router.patch(
  "/",
  protect,
  updateMySettings
);

module.exports = router;