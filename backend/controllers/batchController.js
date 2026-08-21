const Batch = require("../models/Batch");
const User = require("../models/User");

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
      message: "Failed to get batches",
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