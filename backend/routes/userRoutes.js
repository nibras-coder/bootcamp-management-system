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
  warnStudent
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/students", protect, authorize("admin"), getStudents);
router.post("/students/:id/warn", protect, authorize("admin"), warnStudent);

router.get("/mentor/students", protect, authorize("mentor"), getMentorStudents);

router.route("/")
  .get(protect, authorize("admin"), getUsers)
  .post(protect, authorize("admin"), createUser);

router.route("/:id")
  .get(protect, getUserById) // Anyone logged in can get a user by ID
  .put(protect, authorize("admin"), updateUser) // Only admin can update
  .delete(protect, authorize("admin"), deleteUser); // Only admin can delete

module.exports = router;