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
  getMentorBatches,
  getBatchById,
  assignMentors,
  getBatchStudents,
  deleteBatch,
} = require("../controllers/batchController");

// ======================================================
// ADMIN
// ======================================================

// Delete batch
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteBatch
);

// Create batch
router.post(
  "/",
  protect,
  authorize("admin"),
  createBatch
);

// Assign mentors
router.put(
  "/:id/mentors",
  protect,
  authorize("admin"),
  assignMentors
);

// ======================================================
// AUTHENTICATED USERS
// ======================================================

// Get all batches
router.get(
  "/",
  protect,
  getBatches
);

// IMPORTANT:
// This route MUST come before "/:id"
// Otherwise "mentor" will be treated as a batch ID.
router.get(
  "/mentor",
  protect,
  authorize("mentor"),
  getMentorBatches
);

// Get one batch
router.get(
  "/:id",
  protect,
  getBatchById
);

// Get students in batch
router.get(
  "/:id/students",
  protect,
  getBatchStudents
);

module.exports = router;