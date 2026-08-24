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
  deleteBatch,
} = require("../controllers/batchController");

// Admin

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
// Authenticated uers

// Get all batches
router.get(
  "/",
  protect,
  getBatches
);

// Get one batch
router.get(
  "/:id",
  protect,
  getBatchById
);

// Get students in track
router.get(
  "/:id/students",
  protect,
  getBatchStudents
);

module.exports = router;