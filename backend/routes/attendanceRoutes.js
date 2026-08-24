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

// Admin can view all attendance, mentor can view their own
router.get(
  "/",
  protect,
  authorize("mentor", "admin"),
  getMentorAttendance
);

router.get(
  "/student/:studentId",
  protect,
  authorize("mentor", "admin"),
  getStudentAttendance
);

router.post(
  "/",
  protect,
  authorize("mentor", "admin"),
  markAttendance
);

router.put(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  updateAttendance
);

module.exports = router;