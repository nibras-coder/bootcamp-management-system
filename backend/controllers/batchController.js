const Batch = require("../models/Batch");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getBatches = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === "mentor") {
    query._id = { $in: req.user.assignedBatches };
  }
  const batches = await Batch.find(query)
    .populate("mentors", "name email")
    .populate("students", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: batches.length, batches });
});

const getBatchById = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id)
    .populate("mentors", "name email")
    .populate("students", "name email");
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  res.status(200).json({ success: true, batch });
});

const createBatch = asyncHandler(async (req, res) => {
  const { name, track, startDate, endDate } = req.body;
  if (!name || !startDate) {
    return res.status(400).json({ success: false, message: "Batch name and start date are required" });
  }
  const batch = await Batch.create({ name, track, startDate, endDate });
  res.status(201).json({ success: true, message: "Batch created", batch });
});

const updateBatch = asyncHandler(async (req, res) => {
  const { name, track, startDate, endDate, isActive } = req.body;
  const batch = await Batch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  if (name !== undefined) batch.name = name;
  if (track !== undefined) batch.track = track;
  if (startDate !== undefined) batch.startDate = startDate;
  if (endDate !== undefined) batch.endDate = endDate;
  if (isActive !== undefined) batch.isActive = isActive;
  await batch.save();
  res.status(200).json({ success: true, message: "Batch updated", batch });
});

const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  await batch.deleteOne();
  await User.updateMany({ batch: batch._id }, { $set: { batch: null } });
  await User.updateMany({ assignedBatches: batch._id }, { $pull: { assignedBatches: batch._id } });
  res.status(200).json({ success: true, message: "Batch deleted" });
});

const assignMentor = asyncHandler(async (req, res) => {
  const { mentorId } = req.body;
  const [batch, mentor] = await Promise.all([Batch.findById(req.params.id), User.findById(mentorId)]);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  if (!mentor || mentor.role !== "mentor") return res.status(400).json({ success: false, message: "Invalid mentor" });
  await Batch.findByIdAndUpdate(batch._id, { $addToSet: { mentors: mentor._id } });
  await User.findByIdAndUpdate(mentor._id, { $addToSet: { assignedBatches: batch._id } });
  res.status(200).json({ success: true, message: "Mentor assigned to batch" });
});

const enrollStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const [batch, student] = await Promise.all([Batch.findById(req.params.id), User.findById(studentId)]);
  if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
  if (!student || student.role !== "student") return res.status(400).json({ success: false, message: "Invalid student" });
  await Batch.findByIdAndUpdate(batch._id, { $addToSet: { students: student._id } });
  await User.findByIdAndUpdate(student._id, { batch: batch._id });
  res.status(200).json({ success: true, message: "Student enrolled in batch" });
});

module.exports = { getBatches, getBatchById, createBatch, updateBatch, deleteBatch, assignMentor, enrollStudent };
