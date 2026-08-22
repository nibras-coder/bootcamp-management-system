const Progress = require("../models/Progress");
const asyncHandler = require("../utils/asyncHandler");
const { getMyBatchIds } = require("../middleware/mentorScope");

// GET /api/progress?student=xxx
const getProgress = asyncHandler(async (req, res) => {
  const { student, batch } = req.query;
  const query = {};
  if (student) query.student = student;

  const myBatches = getMyBatchIds(req.user);
  if (myBatches) {
    query.batch = batch ? batch : { $in: myBatches };
  } else if (batch) {
    query.batch = batch;
  }

  const records = await Progress.find(query);
  res.status(200).json({ success: true, records });
});

// PUT /api/progress  — upsert one topic's status/notes for a student
// body: { student, batch, topic, status, notes }
const updateProgress = asyncHandler(async (req, res) => {
  const { student, batch, topic, status, notes } = req.body;
  if (!student || !batch || !topic) {
    return res.status(400).json({ success: false, message: "student, batch, and topic are required" });
  }

  const record = await Progress.findOneAndUpdate(
    { student, topic },
    { student, batch, topic, status, notes, updatedBy: req.user._id },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: "Progress updated", record });
});

module.exports = { getProgress, updateProgress };
