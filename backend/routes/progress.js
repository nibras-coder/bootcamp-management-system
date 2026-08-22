const express = require("express");
const router = express.Router();
const { getProgress, updateProgress } = require("../controllers/progressController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "mentor"));
router.get("/", getProgress);
router.put("/", updateProgress);

module.exports = router;
