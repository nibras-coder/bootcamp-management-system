const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  createSubmission,
  getMentorSubmissions,
  getPendingSubmissions,
  getSubmissionById,
  gradeSubmission,
  requestResubmission,
} = require(
  "../controllers/submissionController"
);
// Student submission

router.post(
  "/",
  protect,
  authorize("student"),
  createSubmission
);
// Mentor submission

router.get(
  "/",
  protect,
  authorize("mentor", "admin"),
  getMentorSubmissions
);

router.get(
  "/pending",
  protect,
  authorize("mentor", "admin"),
  getPendingSubmissions
);

router.get(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  getSubmissionById
);

router.put(
  "/:id/grade",
  protect,
  authorize("mentor", "admin"),
  gradeSubmission
);

router.put(
  "/:id/resubmit",
  protect,
  authorize("mentor", "admin"),
  requestResubmission
);

module.exports = router;