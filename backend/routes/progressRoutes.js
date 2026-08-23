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
  getProgress,
  getStudentProgress,
  updateProgress,
} = require(
  "../controllers/progressController"
);

// Get all progress
router.get(
  "/",
  protect,
  authorize("mentor", "student", "admin"),
  getProgress
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