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
      instructor,
      mentors,
      phases,
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
      instructor,
      mentors: mentors || [],
      phases: phases || [],
    });

    const populatedBatch =
      await Batch.findById(batch._id).populate(
        "mentors",
        "name email role"
      );

    const mongoose = require("mongoose");
    let batchObj = populatedBatch.toObject();
    if (batchObj.instructor && mongoose.Types.ObjectId.isValid(batchObj.instructor)) {
      const user = await User.findById(batchObj.instructor).select("name");
      if (user) {
        batchObj.instructor = user;
      }
    }

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batchObj,
    });
  } catch (error) {
    console.error("Create batch error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Track name already exists",
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

    const mongoose = require("mongoose");
    const User = require("../models/User");

    // Manually populate instructor if it's an ObjectId
    const populatedBatches = await Promise.all(batches.map(async (batch) => {
      let batchObj = batch.toObject();
      if (batchObj.instructor && mongoose.Types.ObjectId.isValid(batchObj.instructor)) {
        const user = await User.findById(batchObj.instructor).select("name");
        if (user) {
          batchObj.instructor = user;
        }
      }
      return batchObj;
    }));

    res.status(200).json({
      success: true,
      count: populatedBatches.length,
      data: populatedBatches,
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
// Get mentor's assigned batches
const getMyBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ mentors: req.user.id })
      .populate("mentors", "name email role")
      .sort({ createdAt: -1 });

    const mongoose = require("mongoose");
    const User = require("../models/User");

    // Manually populate instructor if it's an ObjectId
    const populatedBatches = await Promise.all(batches.map(async (batch) => {
      let batchObj = batch.toObject();
      if (batchObj.instructor && mongoose.Types.ObjectId.isValid(batchObj.instructor)) {
        const user = await User.findById(batchObj.instructor).select("name");
        if (user) {
          batchObj.instructor = user;
        }
      }
      return batchObj;
    }));

    res.status(200).json({
      success: true,
      count: populatedBatches.length,
      data: populatedBatches,
    });
  } catch (error) {
    console.error("Get my batches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your assigned batches",
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

const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    // Also delete any students or assignments tied to it? Or leave it to cascade? 
    // Usually a basic findByIdAndDelete is expected for this MVP.
    res.status(200).json({ success: true, message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Delete batch error:", error);
    res.status(500).json({ success: false, message: "Failed to delete batch", error: error.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, track, startDate, endDate, instructor, mentors, phases } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    if (name) batch.name = name;
    if (track) batch.track = track;
    if (startDate) batch.startDate = startDate;
    if (endDate !== undefined) batch.endDate = endDate;
    if (instructor !== undefined) batch.instructor = instructor;
    if (mentors) batch.mentors = mentors;
    if (phases) batch.phases = phases;

    await batch.save();

    const updatedBatch = await Batch.findById(id).populate("mentors", "name email role");

    res.status(200).json({ success: true, message: "Batch updated successfully", data: updatedBatch });
  } catch (error) {
    console.error("Update batch error:", error);
    res.status(500).json({ success: false, message: "Failed to update batch", error: error.message });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getMyBatches,
  getBatchById,
  assignMentors,
  getBatchStudents,
  deleteBatch,
  updateBatch,
};