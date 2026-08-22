const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/mentorController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, authorize("admin", "mentor"), getDashboard);

module.exports = router;
