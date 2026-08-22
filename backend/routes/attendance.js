const express = require("express");
const router = express.Router();
const { getAttendance, getStudentHistory, markAttendance } = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "mentor"));
router.get("/", getAttendance);
router.get("/history", getStudentHistory);
router.post("/", markAttendance);

module.exports = router;
