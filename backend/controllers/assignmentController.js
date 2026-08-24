const Assignment = require("../models/Assignment");
const Batch = require("../models/Batch");
const User = require("../models/User");

// Create assignmet

const createAssignment = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const {
      title,
      description,
      instructions,
      batch,
      deadline,
      maxScore,
    } = req.body;

    if (
      !title ||
      !description ||
      !batch ||
      !deadline ||
      maxScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, batch, deadline and maximum score are required",
      });
    }

    // Check that mentor is assigned to batch
    if (req.user.role !== "admin") {
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
    }

    const assignment = await Assignment.create({
      title,
      description,
      instructions,
      batch,
      createdBy: mentorId,
      deadline,
      maxScore,
    });

    const populatedAssignment =
      await Assignment.findById(assignment._id)
        .populate("batch", "name track")
        .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error(
      "Create assignment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};
// Get assignment -> Mentor

const getMentorAssignments = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const assignments = await Assignment.find({
      batch: { $in: batchIds },
    })
      .populate("batch", "name track")
      .populate("createdBy", "name email")
      .sort({
        deadline: 1,
      });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error(
      "Get mentor assignments error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get assignments",
      error: error.message,
    });
  }
};
const getAssignments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "student") {
      query.batch = req.user.batch;
    } else if (req.user.role === "mentor") {
      const batches = await Batch.find({ mentors: req.user.id }).select("_id");
      query.batch = { $in: batches.map((batch) => batch._id) };
    }

    const assignments = await Assignment.find(query)
      .populate("batch", "name track")
      .populate("createdBy", "name email")
      .sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get assignments",
      error: error.message,
    });
  }
};

// Get one assignment

const getAssignmentById = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const assignment =
      await Assignment.findById(id)
        .populate("batch", "name track")
        .populate("createdBy", "name email");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (req.user.role !== "admin") {
      const mentorBatch =
        await Batch.findOne({
          _id: assignment.batch._id,
          mentors: mentorId,
        });

      if (!mentorBatch) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot access this assignment",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(
      "Get assignment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get assignment",
      error: error.message,
    });
  }
};

const getMyAssignments = async (req, res) => {
  try {
    // Get logged-in student's ID
    const studentId = req.user.id;

    
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

    
    if (!student.batch) {
      return res.status(404).json({
        success: false,
        message: "Student is not assigned to a batch",
      });
    }

    // Get assignments for student's batch

    const assignments = await Assignment.find({
      batch: student.batch._id,
    })
      .populate("batch", "name track")
      .populate("createdBy", "name email")
      .sort({
        deadline: 1,
      });

    // Separate upcoming and past assignments

    const now = new Date();

    const upcomingAssignments = assignments.filter(
      (assignment) =>
        new Date(assignment.deadline) >= now
    );

    const pastAssignments = assignments.filter(
      (assignment) =>
        new Date(assignment.deadline) < now
    );

    res.status(200).json({
      success: true,

      count: assignments.length,

      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          batch: student.batch,
        },

        assignments,

        upcomingAssignments,

        pastAssignments,
      },
    });
  } catch (error) {
    console.error(
      "Get my assignments error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get your assignments",
      error: error.message,
    });
  }
};
// Update assignment -> Mentor

const updateAssignment = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const assignment =
      await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check mentor owns the batch
    if (req.user.role !== "admin") {
      const mentorBatch =
        await Batch.findOne({
          _id: assignment.batch,
          mentors: mentorId,
        });

      if (!mentorBatch) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot update this assignment",
        });
      }
    }

    const {
      title,
      description,
      instructions,
      deadline,
      maxScore,
    } = req.body;

    if (title !== undefined) {
      assignment.title = title;
    }

    if (description !== undefined) {
      assignment.description = description;
    }

    if (instructions !== undefined) {
      assignment.instructions = instructions;
    }

    if (deadline !== undefined) {
      assignment.deadline = deadline;
    }

    if (maxScore !== undefined) {
      assignment.maxScore = maxScore;
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message:
        "Assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error(
      "Update assignment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update assignment",
      error: error.message,
    });
  }
};
// Delete assignment -> Mentor

const deleteAssignment = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const assignment =
      await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (req.user.role !== "admin") {
      const mentorBatch =
        await Batch.findOne({
          _id: assignment.batch,
          mentors: mentorId,
        });

      if (!mentorBatch) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot delete this assignment",
        });
      }
    }

    await Assignment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "Assignment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete assignment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete assignment",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getMentorAssignments,
  getAssignments,
  getAssignmentById,
  getMyAssignments,
  updateAssignment,
  deleteAssignment,
};