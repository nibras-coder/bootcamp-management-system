const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  applyToBatch,
  getMyApplication,
  getMyApplications,
  getStudentApplications,
  submitPhase,
  getBatchApplications,
  reviewSubmission,
  uploadApplicationFile,
} = require("../controllers/applicationController");

// Student Routes
router.post("/apply", protect, applyToBatch);
router.post(
  "/upload",
  protect,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Application file upload error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  },
  uploadApplicationFile
);
router.get("/my-application/:batchId", protect, getMyApplication);
router.get("/my-applications", protect, getMyApplications);
router.post("/:applicationId/submit", protect, submitPhase);

// Admin Routes
router.get("/batch/:batchId", protect, authorize("admin"), getBatchApplications);
router.get("/student/:studentId", protect, authorize("admin"), getStudentApplications);
router.put("/:applicationId/review", protect, authorize("admin"), reviewSubmission);

module.exports = router;
