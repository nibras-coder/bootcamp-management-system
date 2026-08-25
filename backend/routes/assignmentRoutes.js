const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
  getAssignments,
  getMyAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

// ==========================================
// Mentor / Admin / Student assignments
// ==========================================

router.get(
  "/",
  protect,
  authorize("mentor", "student", "admin"),
  getAssignments
);

// ==========================================
// Student's detailed assignments
// ==========================================

router.get(
  "/my",
  protect,
  authorize("student"),
  getMyAssignments
);

// ==========================================
// Get one assignment
// ==========================================

router.get(
  "/:id",
  protect,
  authorize("mentor", "student", "admin"),
  getAssignmentById
);

// ==========================================
// Create
// ==========================================

router.post(
  "/",
  protect,
  authorize("mentor", "admin"),
  createAssignment
);

// ==========================================
// Update
// ==========================================

router.put(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  updateAssignment
);

// ==========================================
// Delete
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  deleteAssignment
);

module.exports = router;