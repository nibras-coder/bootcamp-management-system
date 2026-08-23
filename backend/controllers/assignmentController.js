const Assignment = require("../models/Assignment");
const Batch = require("../models/Batch");

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

    const assignment =
      await Assignment.create({
        title,
        description,
        instructions,
        batch,
        createdBy: mentorId,
        deadline,
        maxScore,
      });

    const populatedAssignment =
      await Assignment.findById(
        assignment._id
      )
        .populate(
          "batch",
          "name track"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.status(201).json({
      success: true,
      message:
        "Assignment created successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error(
      "Create assignment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create assignment",
      error: error.message,
    });
  }
};
const getAssignments = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let assignments = [];

    if (userRole === "student") {
      // Students only see assignments for their batch
      assignments = await Assignment.find({
        batch: req.user.batch,
      })
        .populate("batch", "name track")
        .populate("createdBy", "name email")
        .sort({ deadline: 1 });
    } else {
      // Mentors see assignments for batches they mentor
      const batches = await Batch.find({
        mentors: userId,
      }).select("_id");

      const batchIds = batches.map((batch) => batch._id);

      assignments = await Assignment.find({
        batch: { $in: batchIds },
      })
        .populate("batch", "name track")
        .populate("createdBy", "name email")
        .sort({ deadline: 1 });
    }

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
        .populate(
          "batch",
          "name track"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

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
      message:
        "Failed to get assignment",
      error: error.message,
    });
  }
};
// Update assignment

const updateAssignment = async (
  req,
  res
) => {
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
      assignment.description =
        description;
    }

    if (instructions !== undefined) {
      assignment.instructions =
        instructions;
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
// Delete assignment

const deleteAssignment = async (
  req,
  res
) => {
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
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};