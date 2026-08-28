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
  getMyBatches,
  getBatchById,
  assignMentors,
  getBatchStudents,
  deleteBatch,
  updateBatch,
  toggleCloseRegistration,
  getPublicBatches,
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

// Update batch
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateBatch
);

// Toggle close registration
router.put(
  "/:id/toggle-registration",
  protect,
  authorize("admin"),
  toggleCloseRegistration
);
// Public route - Get active batches for display (must be before /:id)
router.get(
  "/public",
  getPublicBatches
);

// Authenticated users

// Get all batches
router.get(
  "/my-batches",
  protect,
  getMyBatches
);

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