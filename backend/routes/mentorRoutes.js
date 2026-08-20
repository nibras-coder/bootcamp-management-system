const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
  getMentorDashboard,
  getMentorStudents,
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

module.exports = router;