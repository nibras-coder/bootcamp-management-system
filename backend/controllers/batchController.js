const Batch = require("../models/Batch");
const User = require("../models/User");
<<<<<<< HEAD
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
=======

// Create batch

const createBatch = async (req, res) => {
  try {
    const {
      name,
      track,
      startDate,
      endDate,
      mentors,
    } = req.body;

    if (!name || !startDate) {
      return res.status(400).json({
        success: false,
        message:
          "Batch name and start date are required",
      });
    }

    // Validate mentors if provided
    if (mentors && mentors.length > 0) {
      const mentorUsers = await User.find({
        _id: { $in: mentors },
        role: "mentor",
      });

      if (
        mentorUsers.length !== mentors.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected users are not mentors",
        });
      }
    }

    const batch = await Batch.create({
      name,
      track,
      startDate,
      endDate,
      mentors: mentors || [],
    });

    const populatedBatch =
      await Batch.findById(batch._id).populate(
        "mentors",
        "name email role"
      );

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: populatedBatch,
    });
  } catch (error) {
    console.error("Create batch error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Batch name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create batch",
      error: error.message,
    });
  }
};
// Get all batch

const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate(
        "mentors",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    console.error("Get batches error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get Tracks",
      error: error.message,
    });
  }
};
// Get one batch

const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(
      req.params.id
    ).populate(
      "mentors",
      "name email role"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error(
      "Get batch error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get batch",
      error: error.message,
    });
  }
};
// Assign mentors to batch

const assignMentors = async (req, res) => {
  try {
    const { mentors } = req.body;

    if (!Array.isArray(mentors)) {
      return res.status(400).json({
        success: false,
        message:
          "Mentors must be an array of user IDs",
      });
    }

    const mentorUsers = await User.find({
      _id: { $in: mentors },
      role: "mentor",
    });

    if (
      mentorUsers.length !== mentors.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more IDs do not belong to mentors",
      });
    }

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        mentors,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "mentors",
      "name email role"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Mentors assigned successfully",
      data: batch,
    });
  } catch (error) {
    console.error(
      "Assign mentors error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to assign mentors",
      error: error.message,
    });
  }
};

// Get batch student

const getBatchStudents = async (
  req,
  res
) => {
  try {
    const batch = await Batch.findById(
      req.params.id
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const students = await User.find({
      batch: batch._id,
      role: "student",
    })
      .select("-password")
      .populate("batch", "name track");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(
      "Get batch students error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get batch students",
      error: error.message,
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  assignMentors,
  getBatchStudents,
};
>>>>>>> origin/main
