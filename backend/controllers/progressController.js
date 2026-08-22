const Progress = require("../models/Progress");
<<<<<<< HEAD
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
=======
const User = require("../models/User");
const Batch = require("../models/Batch");

// Create progress

const createProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const {
      student,
      batch,
      topic,
      status,
      week,
      notes,
    } = req.body;

    if (
      !student ||
      !batch ||
      !topic ||
      !week
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student, batch, topic and week are required",
      });
    }

    // Check mentor owns the batch

    const mentorBatch = await Batch.findOne({
      _id: batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this batch",
      });
    }

    // Check student belongs to batch

    const studentUser = await User.findOne({
      _id: student,
      role: "student",
      batch: batch,
    });

    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found in this track",
      });
    }

    // Prevent duplicate topic/week

    const existingProgress =
      await Progress.findOne({
        student,
        topic,
        week,
      });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message:
          "Progress for this topic and week already exists",
      });
    }

    const progress = await Progress.create({
      student,
      track,
      topic,
      status:
        status || "Not Started",
      week,
      notes,
      updatedBy: mentorId,
    });

    const populatedProgress =
      await Progress.findById(progress._id)
        .populate("student", "name email")
        .populate("batch", "name track")
        .populate("updatedBy", "name");

    res.status(201).json({
      success: true,
      message: "Progress created successfully",
      data: populatedProgress,
    });
  } catch (error) {
    console.error(
      "Create progress error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create progress",
      error: error.message,
    });
  }
};
// Get mentor progress

const getMentorProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find mentor's batches
    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const progress = await Progress.find({
      batch: { $in: batchIds },
    })
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("updatedBy", "name")
      .sort({
        updatedAt: -1,
      });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    console.error(
      "Get mentor progress error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get progress",
      error: error.message,
    });
  }
};

// Get student progress

const getStudentProgress = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { studentId } = req.params;

    // Find mentor's batches
    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // Make sure student belongs to mentor
    const student = await User.findOne({
      _id: studentId,
      role: "student",
      batch: { $in: batchIds },
    }).populate("batch", "name track");

    if (!student) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot access this student",
      });
    }

    const progress = await Progress.find({
      student: studentId,
    }).sort({
      week: 1,
      createdAt: 1,
    });

    // Calculate summary
    const total = progress.length;

    const completed = progress.filter(
      (item) =>
        item.status === "Completed"
    ).length;

    const inProgress = progress.filter(
      (item) =>
        item.status === "In Progress"
    ).length;

    const needsImprovement =
      progress.filter(
        (item) =>
          item.status ===
          "Needs Improvement"
      ).length;

    const notStarted = progress.filter(
      (item) =>
        item.status === "Not Started"
    ).length;

    const completionPercentage =
      total > 0
        ? (completed / total) * 100
        : 0;

    res.status(200).json({
      success: true,

      data: {
        student,

        summary: {
          total,
          completed,
          inProgress,
          needsImprovement,
          notStarted,
          completionPercentage:
            Number(
              completionPercentage.toFixed(1)
            ),
        },

        progress,
      },
    });
  } catch (error) {
    console.error(
      "Get student progress error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get student progress",
      error: error.message,
    });
  }
};
// Update progress

const updateProgress = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const {
      status,
      notes,
      topic,
      week,
    } = req.body;

    const progress =
      await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    // Check mentor owns batch

    const mentorBatch = await Batch.findOne({
      _id: progress.batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot update this progress",
      });
    }

    if (status !== undefined) {
      progress.status = status;
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    if (topic !== undefined) {
      progress.topic = topic;
    }

    if (week !== undefined) {
      progress.week = week;
    }

    progress.updatedBy = mentorId;

    await progress.save();

    const updatedProgress =
      await Progress.findById(id)
        .populate("student", "name email")
        .populate("batch", "name track")
        .populate("updatedBy", "name");

    res.status(200).json({
      success: true,
      message:
        "Progress updated successfully",
      data: updatedProgress,
    });
  } catch (error) {
    console.error(
      "Update progress error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update progress",
      error: error.message,
    });
  }
};

module.exports = {
  createProgress,
  getMentorProgress,
  getStudentProgress,
  updateProgress,
};
>>>>>>> origin/main
