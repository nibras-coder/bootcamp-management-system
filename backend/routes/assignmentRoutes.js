const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  getAssignments,
  getMyAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

// Get mentor, student, or admin assignments
router.get(
  "/",
  protect,
  getAssignments
);

router.get(
  "/my",
  protect,
  authorize("student"),
  getMyAssignments
);

// Get one assignment
router.get(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  getAssignmentById
);

// Create assignment
router.post(
  "/",
  protect,
  authorize("mentor", "admin"),
  createAssignment
);

// Update assignment
router.put(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  updateAssignment
);

// Delete assignment
router.delete(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  deleteAssignment
);

module.exports = router;