const express = require("express");
const router = express.Router();
const { getResources, createResource, deleteResource } = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.route("/")
  .get(protect, getResources)
  .post(protect, authorize("admin", "mentor"), upload.single("file"), createResource);

router.route("/:id")
  .delete(protect, authorize("admin", "mentor"), deleteResource);

module.exports = router;
