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
  uploadProfilePhoto,
} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const uploadProfilePhotoMiddleware = require(
  "../middleware/uploadMiddleware"
);

router.get(
  "/students",
  protect,
  authorize("admin"),
  getStudents
);

router.get(
  "/mentor/students",
  protect,
  authorize("mentor"),
  getMentorStudents
);

router.post(
  "/profile/photo",
  protect,
  authorize("mentor"),
  uploadProfilePhotoMiddleware.single("photo"),
  uploadProfilePhoto
);

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