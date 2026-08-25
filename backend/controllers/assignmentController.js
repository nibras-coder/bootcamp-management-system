const Assignment = require("../models/assignment");
const Batch = require("../models/Batch");
const User = require("../models/User");

// ==========================================
// CREATE ASSIGNMENT
// ==========================================

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
        message: "Deadline cannot be before start date",
      });
    }

    // Check batch exists
    const selectedBatch = await Batch.findById(batch);

    if (!selectedBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Mentor can only create assignment for assigned batch
    if (req.user.role === "mentor") {
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
    }

    const assignment = await Assignment.create({
      title,
      description,
      instructions,
      batch,
      createdBy: mentorId,
      startDate,
      deadline,
      maxScore,
      resourceLink,
    });

    const populatedAssignment = await Assignment.findById(
      assignment._id
    )
      .populate("batch", "name track")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

// ==========================================
// GET ASSIGNMENTS
// Mentor / Student / Admin
// ==========================================

const getAssignments = async (req, res) => {
  try {
    let query = {};

    // Student
    if (req.user.role === "student") {
      if (!req.user.batch) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      query.batch = req.user.batch;
    }

    // Mentor
    else if (req.user.role === "mentor") {
      const batches = await Batch.find({
        mentors: req.user.id,
      }).select("_id");

      const batchIds = batches.map((batch) => batch._id);

      query.batch = {
        $in: batchIds,
      };
    }

    // Admin sees everything
    const assignments = await Assignment.find(query)
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
    console.error("Get assignments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get assignments",
      error: error.message,
    });
  }
};

// ==========================================
// GET STUDENT ASSIGNMENTS
// ==========================================

const getMyAssignments = async (req, res) => {
  try {
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
      return res.status(200).json({
        success: true,
        count: 0,
        data: {
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            batch: null,
          },
          assignments: [],
          upcomingAssignments: [],
          pastAssignments: [],
        },
      });
    }

    const assignments = await Assignment.find({
      batch: student.batch._id,
    })
      .populate("batch", "name track")
      .populate("createdBy", "name email")
      .sort({
        deadline: 1,
      });

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
      message: "Failed to get your assignments",
      error: error.message,
    });
  }
};

// ==========================================
// GET ONE ASSIGNMENT
// ==========================================

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

    // Admin can access everything
    if (req.user.role === "admin") {
      return res.status(200).json({
        success: true,
        data: assignment,
      });
    }

    // Student can access assignments belonging to their batch
    if (req.user.role === "student") {
      if (
        !req.user.batch ||
        assignment.batch._id.toString() !==
          req.user.batch.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this assignment",
        });
      }
    }

    // Mentor must be assigned to batch
    if (req.user.role === "mentor") {
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
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get assignment",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE ASSIGNMENT
// ==========================================

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

    // Mentor ownership check
    if (req.user.role === "mentor") {
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

    const newStartDate =
      startDate !== undefined
        ? startDate
        : assignment.startDate;

    const newDeadline =
      deadline !== undefined
        ? deadline
        : assignment.deadline;

    if (new Date(newDeadline) < new Date(newStartDate)) {
      return res.status(400).json({
        success: false,
        message: "Deadline cannot be before start date",
      });
    }

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

    await assignment.save();

    const updatedAssignment =
      await Assignment.findById(assignment._id)
        .populate("batch", "name track")
        .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE ASSIGNMENT
// ==========================================

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

    if (req.user.role === "mentor") {
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
    }

    await Assignment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getMyAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};