const express = require("express");
const router = express.Router();
const { getSubmissions, gradeSubmission } = require("../controllers/submissionController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "mentor"));
router.get("/", getSubmissions);
router.put("/:id", gradeSubmission);

module.exports = router;
