const express = require("express");
const router = express.Router();
const {
  getBatches, getBatchById, createBatch, updateBatch, deleteBatch, assignMentor, enrollStudent,
} = require("../controllers/batchController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.route("/").get(authorize("admin", "mentor"), getBatches).post(authorize("admin"), createBatch);
router.route("/:id")
  .get(authorize("admin", "mentor", "student"), getBatchById)
  .put(authorize("admin"), updateBatch)
  .delete(authorize("admin"), deleteBatch);
router.put("/:id/assign-mentor", authorize("admin"), assignMentor);
router.put("/:id/enroll-student", authorize("admin"), enrollStudent);

module.exports = router;
