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
  uploadProfilePhoto,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ======================================================
// STUDENT ROUTES
// ======================================================

router.get(
  "/students",
  protect,
  authorize("admin"),
  getStudents
);

router.post(
  "/students/:id/warn",
  protect,
  authorize("admin"),
  warnStudent
);

// ======================================================
// MENTOR ROUTES
// ======================================================

router.get(
  "/mentor/students",
  protect,
  authorize("mentor"),
  getMentorStudents
);

// ======================================================
// PROFILE PHOTO
// ======================================================

router.post(
  "/profile/photo",
  protect,
  upload.single("photo"),
  uploadProfilePhoto
);

// ======================================================
// USER ROUTES
// ======================================================

router
  .route("/")
  .get(
    protect,
    authorize("admin"),
    getUsers
  )
  .post(
    protect,
    authorize("admin"),
    createUser
  );

// ======================================================
// USER BY ID
// ======================================================

router
  .route("/:id")
  .get(
    protect,
    getUserById
  )
  .put(
    protect,
    authorize("admin"),
    updateUser
  )
  .delete(
    protect,
    authorize("admin"),
    deleteUser
  );

module.exports = router;