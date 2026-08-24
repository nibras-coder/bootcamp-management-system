const express = require("express");

const {
  getStudentDashboard,
  getStudentSchedule,
  getStudentResources,
} = require("../controllers/studentController");

const {
  getMyAttendance,
} = require("../controllers/attendanceController");

const {
    getMyProgress,
  } = require("../controllers/progressController");

  const {
    getMyAssignments,
  } = require("../controllers/assignmentController");
 
  const {
    getMyAnnouncements,
  } = require("../controllers/announcementController");
  

const { protect } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


router.get(
  "/dashboard",
  protect,
  roleMiddleware("student"),
  getStudentDashboard
);

router.get(
  "/schedule",
  protect,
  roleMiddleware("student"),
  getStudentSchedule
);

router.get(
  "/resources",
  protect,
  roleMiddleware("student"),
  getStudentResources
);

router.get(
  "/attendance",
  protect,
  roleMiddleware("student"),
  getMyAttendance
);

router.get(
    "/progress",
    protect,
    roleMiddleware("student"),
    getMyProgress
  );
  
  router.get(
    "/assignments",
    protect,
    roleMiddleware("student"),
    getMyAssignments
  );

  router.get(
    "/announcements",
    protect,
    roleMiddleware("student"),
    getMyAnnouncements
  );

module.exports = router;
