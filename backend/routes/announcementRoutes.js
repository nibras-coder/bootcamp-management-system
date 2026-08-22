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
} = require(
  "../controllers/announcementController"
);

// Get mentor announcements
router.get(
  "/",
  protect,
  authorize("mentor"),
  getMentorAnnouncements
);

// Get one announcement
router.get(
  "/:id",
  protect,
  authorize("mentor"),
  getAnnouncementById
);

// Create announcement
router.post(
  "/",
  protect,
  authorize("mentor"),
  createAnnouncement
);

// Update announcement
router.put(
  "/:id",
  protect,
  authorize("mentor"),
  updateAnnouncement
);

// Delete announcement
router.delete(
  "/:id",
  protect,
  authorize("mentor"),
  deleteAnnouncement
);

module.exports = router;