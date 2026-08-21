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
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;