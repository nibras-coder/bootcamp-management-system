const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
  getMentorDashboard,
  getMentorStudents,
  getMentorBatches,
} = require("../controllers/mentorController");

// Mentor Dashboard
router.get(
  "/dashboard",
  protect,
  authorize("mentor"),
  getMentorDashboard
);

// Mentor Students
router.get(
  "/students",
  protect,
  authorize("mentor"),
  getMentorStudents
);

// Mentor Batches
router.get(
  "/batches",
  protect,
  authorize("mentor"),
  getMentorBatches
);

module.exports = router;