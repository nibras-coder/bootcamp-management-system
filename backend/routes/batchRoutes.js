const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  createBatch,
  getBatches,
  getBatchById,
  assignMentors,
  getBatchStudents,
  getMentorBatches,
} = require("../controllers/batchController");

// ===============================
// ADMIN ROUTES
// ===============================

// Create batch
router.post(
  "/",
  protect,
  authorize("admin"),
  createBatch
);

// Assign mentors to batch
router.put(
  "/:id/mentors",
  protect,
  authorize("admin"),
  assignMentors
);

// ===============================
// AUTHENTICATED USER ROUTES
// ===============================

// Get all batches
router.get(
  "/",
  protect,
  getBatches
);

// Get batches assigned to logged-in mentor
// IMPORTANT: This must come before /:id
router.get(
  "/mentor",
  protect,
  authorize("mentor"),
  getMentorBatches
);

// Get students in a batch
router.get(
  "/:id/students",
  protect,
  getBatchStudents
);

// Get one batch
router.get(
  "/:id",
  protect,
  getBatchById
);

module.exports = router;