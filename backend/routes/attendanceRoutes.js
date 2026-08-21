const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  markAttendance,
  getMentorAttendance,
  getStudentAttendance,
  updateAttendance,
} = require(
  "../controllers/attendanceController"
);

// Get mentor attendance history
router.get(
  "/",
  protect,
  authorize("mentor"),
  getMentorAttendance
);

// Get attendance for one student
router.get(
  "/student/:studentId",
  protect,
  authorize("mentor"),
  getStudentAttendance
);

// Mark attendance
router.post(
  "/",
  protect,
  authorize("mentor"),
  markAttendance
);

// Update attendance
router.put(
  "/:id",
  protect,
  authorize("mentor"),
  updateAttendance
);

module.exports = router;