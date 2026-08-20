const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require(
  "../middleware/roleMiddleware"
);

const {
  getStudents,
  getUserById,
  getMentorStudents,
} = require("../controllers/userController");

// Admin


// Get all students
router.get(
  "/students",
  protect,
  authorize("admin"),
  getStudents
);

// Get students assigned to logged-in mentor
router.get(
  "/mentor/students",
  protect,
  authorize("mentor"),
  getMentorStudents
);

// Get one user
router.get(
  "/:id",
  protect,
  getUserById
);

module.exports = router;