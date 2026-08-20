const Progress = require("../models/Progress");
const User = require("../models/User");
const Batch = require("../models/Batch");

// CREATE PROGRESS - MENTOR

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

    if (!student || !batch || !topic || !week) {
      return res.status(400).json({
        success: false,
        message:
          "Student, batch, topic and week are required",
      });
    }

    // Check batch belongs to mentor

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
          "Student not found in this batch",
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
      batch,
      topic,
      status: status || "Not Started",
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
// Get all progress - mentor

const getMentorProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;

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
// Get one student progress - mentor

const getStudentProgress = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { studentId } = req.params;

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // Make sure student belongs to mentor's batch

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
    })
      .populate("batch", "name track")
      .populate("updatedBy", "name")
      .sort({
        week: 1,
        createdAt: 1,
      });

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
// Get my progress 

const getMyProgress = async (req, res) => {
  try {
      const studentId = req.user.id;

    // Check that the user exists and is a student

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    }).populate("batch", "name track");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get ONLY the logged-in student's progress

    const progress = await Progress.find({
      student: studentId,
    })
      .populate("batch", "name track")
      .populate("updatedBy", "name")
      .sort({
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
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          batch: student.batch,
        },

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
      "Get my progress error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get your progress",
      error: error.message,
    });
  }
};
// Update progress ->mentor

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
  getMyProgress,
  updateProgress,
};