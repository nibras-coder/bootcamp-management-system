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
} = require("../controllers/batchController");

// Admin

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

// Get students in batch
router.get(
  "/:id/students",
  protect,
  getBatchStudents
);

module.exports = router;