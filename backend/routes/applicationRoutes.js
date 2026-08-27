const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyToBatch,
  getMyApplication,
  getMyApplications,
  submitPhase,
  getBatchApplications,
  reviewSubmission,
} = require("../controllers/applicationController");

// Student Routes
router.post("/apply", protect, applyToBatch);
router.get("/my-application/:batchId", protect, getMyApplication);
router.get("/my-applications", protect, getMyApplications);
router.post("/:applicationId/submit", protect, submitPhase);

// Admin Routes
router.get("/batch/:batchId", protect, authorize("admin"), getBatchApplications);
router.put("/:applicationId/review", protect, authorize("admin"), reviewSubmission);

module.exports = router;
