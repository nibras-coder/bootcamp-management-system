const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  createAnnouncement,
  getMentorAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  markAnnouncementRead,
} = require(
  "../controllers/announcementController"
);

// Get all announcements (for admin)
router.get(
  "/all",
  protect,
  authorize("admin"),
  getAllAnnouncements
);

// Get mentor announcements
router.get(
  "/",
  protect,
  authorize("mentor", "admin"),
  getMentorAnnouncements
);

// Get one announcement
router.get(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  getAnnouncementById
);

// Create announcement
router.post(
  "/",
  protect,
  authorize("mentor", "admin"),
  createAnnouncement
);

// Update announcement
router.put(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  updateAnnouncement
);

// Delete announcement
router.delete(
  "/:id",
  protect,
  authorize("mentor", "admin"),
  deleteAnnouncement
);

// Mark as read
router.patch(
  "/:id/read",
  protect,
  authorize("admin", "mentor"),
  markAnnouncementRead
);

module.exports = router;