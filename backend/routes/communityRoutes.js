const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  addMembers,
  removeMember,
  getCommunityMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  markCommunityNotificationsRead,
  getUnreadNotifications,
  getAvailableCommunities,
  joinCommunity,
} = require("../controllers/communityController");

// All routes are protected
router.use(protect);

// Unread notifications summary
router.get("/unread", getUnreadNotifications);

// Available public communities for students to browse/join
router.get("/available", getAvailableCommunities);

// Communities CRUD & listing
router
  .route("/")
  .get(getCommunities)
  .post(authorize("mentor", "admin"), createCommunity);

router
  .route("/:id")
  .get(getCommunityById)
  .put(authorize("mentor", "admin"), updateCommunity)
  .delete(authorize("mentor", "admin"), deleteCommunity);

// Mark community notifications as read
router.put("/:id/read", markCommunityNotificationsRead);

// Student joins a public community
router.post("/:id/join", joinCommunity);

// Member management (Mentor only)
router
  .route("/:id/members")
  .post(authorize("mentor", "admin"), addMembers);

router
  .route("/:id/members/:studentId")
  .delete(authorize("mentor", "admin"), removeMember);

// Messages
router
  .route("/:id/messages")
  .get(getCommunityMessages)
  .post(sendMessage);

router
  .route("/:id/messages/:messageId")
  .put(updateMessage)
  .delete(deleteMessage);

module.exports = router;
