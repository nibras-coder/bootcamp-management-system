const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Mentors can GET (their own students, auto-filtered in controller); only admins can create/edit/delete
router.get("/", protect, authorize("admin", "mentor"), getUsers);
router.get("/:id", protect, authorize("admin", "mentor"), getUserById);
router.post("/", protect, authorize("admin"), createUser);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
