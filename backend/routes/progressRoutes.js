const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  createProgress,
  getMentorProgress,
  getStudentProgress,
  updateProgress,
} = require(
  "../controllers/progressController"
);

// Get all progress for mentor's students
router.get(
  "/",
  protect,
  authorize("mentor"),
  getMentorProgress
);

// Get one student's progress
router.get(
  "/student/:studentId",
  protect,
  authorize("mentor"),
  getStudentProgress
);

// Create progress
router.post(
  "/",
  protect,
  authorize("mentor"),
  createProgress
);

// Update progress
router.put(
  "/:id",
  protect,
  authorize("mentor"),
  updateProgress
);

module.exports = router;