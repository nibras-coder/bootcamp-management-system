const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStudents,  
  getMentorStudents,
  warnStudent,
  assignStudentToMentor,
  getPublicMentors,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public route - Get active mentors (must be before protected routes)
router.get("/public/mentors", getPublicMentors);

router.get("/students", protect, authorize("admin"), getStudents);
router.post("/students/:id/warn", protect, authorize("admin"), warnStudent);
router.post("/students/:studentId/assign-mentor", protect, authorize("admin"), assignStudentToMentor);

router.get("/mentor/students", protect, authorize("mentor"), getMentorStudents);

router.route("/")
  .get(protect, authorize("admin"), getUsers)
  .post(protect, authorize("admin"), createUser);

router.route("/:id")
  .get(protect, getUserById) // Anyone logged in can get a user by ID
  .put(protect, updateUser) // Anyone can update (controller handles authorization)
  .delete(protect, authorize("admin"), deleteUser); // Only admin can delete

module.exports = router;