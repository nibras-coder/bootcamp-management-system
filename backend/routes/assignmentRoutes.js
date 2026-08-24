const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  getMyAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

// Get mentor or student assignments
router.get(
  "/",
  protect,
  authorize("mentor", "student", "admin"),
  getMyAssignments
);

// Get one assignment
router.get(
  "/:id",
  protect,
  authorize("mentor"),
  getAssignmentById
);

// Create assignment
router.post(
  "/",
  protect,
  authorize("mentor"),
  createAssignment
);

// Update assignment
router.put(
  "/:id",
  protect,
  authorize("mentor"),
  updateAssignment
);

// Delete assignment
router.delete(
  "/:id",
  protect,
  authorize("mentor"),
  deleteAssignment
);

module.exports = router;