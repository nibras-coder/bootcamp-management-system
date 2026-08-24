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
  markAnnouncementAsViewed,
  updateAnnouncement,
  deleteAnnouncement,
} = require(
  "../controllers/announcementController"
);

// ==========================================
// GET MENTOR ANNOUNCEMENTS
// ==========================================
router.get(
  "/",
  protect,
  authorize("mentor"),
  getMentorAnnouncements
);

// ==========================================
// CREATE ANNOUNCEMENT
// ==========================================
router.post(
  "/",
  protect,
  authorize("mentor"),
  createAnnouncement
);

// ==========================================
// MARK ANNOUNCEMENT AS VIEWED
// ==========================================
router.post(
  "/:id/view",
  protect,
  authorize("student"),
  markAnnouncementAsViewed
);

// ==========================================
// GET ONE ANNOUNCEMENT
// ==========================================
router.get(
  "/:id",
  protect,
  authorize("mentor"),
  getAnnouncementById
);
// UPDATE ANNOUNCEMENT

router.put(
  "/:id",
  protect,
  authorize("mentor"),
  updateAnnouncement
);


// DELETE ANNOUNCEMENT

router.delete(
  "/:id",
  protect,
  authorize("mentor"),
  deleteAnnouncement
);

module.exports = router;