const Assignment = require("../models/assignment");
const Batch = require("../models/Batch");

// =====================================================
// CREATE ASSIGNMENT
// =====================================================

const createAssignment = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const {
      title,
      description,
      instructions,
      batch,
      startDate,
      deadline,
      maxScore,
      resourceLink,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !batch ||
      !startDate ||
      !deadline ||
      maxScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, batch, start date, deadline and maximum score are required",
      });
    }

    // Validate dates
    if (new Date(deadline) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Deadline cannot be before the start date",
      });
    }

    // Check that the mentor is assigned to this batch
    const mentorBatch = await Batch.findOne({
      _id: batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this batch",
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      instructions: instructions || "",
      batch,
      createdBy: mentorId,
      startDate,
      deadline,
      maxScore,
      resourceLink: resourceLink || "",
    });

    // Return populated assignment
    const populatedAssignment = await Assignment.findById(
      assignment._id
    )
      .populate("batch", "name track")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

// =====================================================
// GET MENTOR ASSIGNMENTS
// =====================================================

const getMentorAssignments = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find batches assigned to this mentor
    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map((batch) => batch._id);

    // Find assignments belonging to mentor's batches
    const assignments = await Assignment.find({
      batch: { $in: batchIds },
    })
      .populate("batch", "name track")
      .populate("createdBy", "name email")
      .sort({ deadline: 1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Get mentor assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get assignments",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ASSIGNMENT
// =====================================================

const getAssignmentById = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate("batch", "name track")
      .populate("createdBy", "name email");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check mentor access
    const mentorBatch = await Batch.findOne({
      _id: assignment.batch._id,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this assignment",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get assignment",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ASSIGNMENT
// =====================================================

const updateAssignment = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check that mentor is assigned to assignment's batch
    const mentorBatch = await Batch.findOne({
      _id: assignment.batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this assignment",
      });
    }

    const {
      title,
      description,
      instructions,
      startDate,
      deadline,
      maxScore,
      resourceLink,
    } = req.body;

    // Update only provided fields
    if (title !== undefined) {
      assignment.title = title;
    }

    if (description !== undefined) {
      assignment.description = description;
    }

    if (instructions !== undefined) {
      assignment.instructions = instructions;
    }

    if (startDate !== undefined) {
      assignment.startDate = startDate;
    }

    if (deadline !== undefined) {
      assignment.deadline = deadline;
    }

    if (maxScore !== undefined) {
      assignment.maxScore = maxScore;
    }

    if (resourceLink !== undefined) {
      assignment.resourceLink = resourceLink;
    }

    // Validate dates after update
    if (
      assignment.startDate &&
      assignment.deadline &&
      new Date(assignment.deadline) <
        new Date(assignment.startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Deadline cannot be before the start date",
      });
    }

    await assignment.save();

    const updatedAssignment =
      await Assignment.findById(assignment._id)
        .populate("batch", "name track")
        .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE ASSIGNMENT
// =====================================================

const deleteAssignment = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check mentor access
    const mentorBatch = await Batch.findOne({
      _id: assignment.batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this assignment",
      });
    }

    await Assignment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createAssignment,
  getMentorAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};