const Assignment = require("../models/assignment");
const Batch = require("../models/Batch");
const User = require("../models/User");
const Submission = require("../models/submission");

// Create assignment

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
      link,
    } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title and deadline are required",
      });
    }

    if (req.user.role !== 'admin') {
      if (!batch) {
        return res.status(400).json({
          success: false,
          message: "Batch is required to create an assignment.",
        });
      }

      const mentorBatch = await Batch.findOne({
        _id: batch,
        mentors: req.user.id,
      });

      if (!mentorBatch) {
        return res.status(403).json({
          success: false,
          message: "You cannot create announcements or assignments for a batch you do not mentor.",
        });
      }
    }

    const assignment = await Assignment.create({
      title,
      description: description || "",
      instructions: instructions || "",
      batch: batch || null,
      createdBy: mentorId,
      deadline,
      maxScore: maxScore !== undefined ? maxScore : 100,
      link: link || "",
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
    console.error("Create assignment error:", error);
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
      // Student sees assignments for their batch + assignments from their mentor
      const student = await User.findById(req.user.id);
      const orConditions = [];
      if (student?.batch) orConditions.push({ batch: student.batch });
      if (student?.mentor) orConditions.push({ createdBy: student.mentor });
      orConditions.push({ batch: null }); // global assignments
      query = { $or: orConditions };
    } else if (req.user.role === "mentor") {
      // Mentor sees assignments they created OR for their batches
      const batches = await Batch.find({ mentors: req.user.id }).select("_id");
      const batchIds = batches.map((b) => b._id);
      query = {
        $or: [
          { createdBy: req.user.id },
          { batch: { $in: batchIds } },
        ],
      };
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
    const studentId = req.user.id;

    const student = await User.findById(studentId)
      .populate("batch", "name track")
      .populate("mentor", "name email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const orConditions = [];
    if (student.batch) orConditions.push({ batch: student.batch._id });
    if (student.mentor) orConditions.push({ createdBy: student.mentor._id || student.mentor });
    orConditions.push({ batch: null });

    const query = { $or: orConditions };

    const [assignments, submissions] = await Promise.all([
      Assignment.find(query)
        .populate("batch", "name track")
        .populate("createdBy", "name email")
        .sort({ deadline: 1 }),
      Submission.find({ student: studentId }),
    ]);

    const submissionMap = new Map(
      submissions.map((s) => [String(s.assignment), s])
    );

    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = submissionMap.get(String(assignment._id));
      let status = "Pending";
      if (submission) status = submission.status;
      return {
        ...assignment.toObject(),
        submission: submission || null,
        status,
        score: submission?.score ?? null,
        feedback: submission?.feedback || "",
      };
    });

    const now = new Date();
    const upcomingAssignments = assignmentsWithStatus.filter(
      (a) => new Date(a.deadline) >= now
    );
    const pastAssignments = assignmentsWithStatus.filter(
      (a) => new Date(a.deadline) < now
    );

    res.status(200).json({
      success: true,
      count: assignmentsWithStatus.length,
      data: assignmentsWithStatus,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        batch: student.batch,
      },
      upcomingAssignments,
      pastAssignments,
    });
  } catch (error) {
    console.error("Get my assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your assignments",
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

    // Check mentor owns the batch or created the assignment
    if (req.user.role !== "admin") {
      const isCreator = String(assignment.createdBy) === String(mentorId);
      if (!isCreator) {
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
    }

    const {
      title,
      description,
      instructions,
      batch,
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

    if (batch !== undefined) {
      assignment.batch = batch;
    }

    if (deadline !== undefined) {
      assignment.deadline = deadline;
    }

    if (maxScore !== undefined) {
      assignment.maxScore = maxScore;
    }

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("batch", "name track")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message:
        "Assignment updated successfully",
      data: populatedAssignment,
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
      const isCreator = String(assignment.createdBy) === String(mentorId);
      if (!isCreator) {
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