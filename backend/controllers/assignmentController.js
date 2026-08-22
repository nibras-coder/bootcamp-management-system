const Assignment = require("../models/Assignment");
const asyncHandler = require("../utils/asyncHandler");
const { getMyBatchIds } = require("../middleware/mentorScope");

const getAssignments = asyncHandler(async (req, res) => {
  const query = {};
  const myBatches = getMyBatchIds(req.user);
  if (myBatches) query.batch = { $in: myBatches };

  const assignments = await Assignment.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: assignments.length, assignments });
});

const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, instructions, batch, deadline, maxScore } = req.body;
  if (!title || !description || !batch || !deadline) {
    return res.status(400).json({ success: false, message: "title, description, batch, and deadline are required" });
  }
  const assignment = await Assignment.create({
    title, description, instructions, batch, deadline, maxScore,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, message: "Assignment created", assignment });
});

const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

  const { title, description, instructions, deadline, maxScore, isPublished } = req.body;
  if (title !== undefined) assignment.title = title;
  if (description !== undefined) assignment.description = description;
  if (instructions !== undefined) assignment.instructions = instructions;
  if (deadline !== undefined) assignment.deadline = deadline;
  if (maxScore !== undefined) assignment.maxScore = maxScore;
  if (isPublished !== undefined) assignment.isPublished = isPublished;

  await assignment.save();
  res.status(200).json({ success: true, message: "Assignment updated", assignment });
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
  await assignment.deleteOne();
  res.status(200).json({ success: true, message: "Assignment deleted" });
});

module.exports = { getAssignments, createAssignment, updateAssignment, deleteAssignment };
