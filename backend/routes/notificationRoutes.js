const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  notifyRegistrationClosed,
  notifyNewPhase,
  notifyAdminAboutSubmission,
  notifyStudentAboutReview,
} = require("../controllers/notificationController");

// Student, Admin, Mentor routes - Get all notifications
router.get(
  "/",
  protect,
  getNotifications
);

// Student, Admin, Mentor routes - Get unread count
router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

// Student, Admin, Mentor routes - Mark as read
router.put(
  "/:id/read",
  protect,
  markAsRead
);

// Student, Admin, Mentor routes - Mark all as read
router.put(
  "/read-all",
  protect,
  markAllAsRead
);

// Student, Admin, Mentor routes - Delete notification
router.delete(
  "/:id",
  protect,
  deleteNotification
);

// Student, Admin, Mentor routes - Delete all notifications
router.delete(
  "/",
  protect,
  deleteAllNotifications
);

// Admin routes - Create notification
router.post(
  "/",
  protect,
  authorize("admin"),
  createNotification
);

// Admin routes - Notify students about registration closed
router.post(
  "/batch/:batchId/registration-closed",
  protect,
  authorize("admin"),
  notifyRegistrationClosed
);

// Admin routes - Notify students about new phase
router.post(
  "/batch/:batchId/new-phase/:phaseId/:phaseName",
  protect,
  authorize("admin"),
  notifyNewPhase
);

module.exports = router;