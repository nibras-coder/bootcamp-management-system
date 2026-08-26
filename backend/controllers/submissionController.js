const Submission = require("../models/submission");
const Assignment = require("../models/assignment");
const User = require("../models/User");
const Batch = require("../models/Batch");

/**
 * Helper: Check if a mentor has authority over a submission
 */
const mentorHasAccessToSubmission = async (mentorId, submission) => {
  if (!submission) return false;
  
  // Check if student belongs to mentor directly
  const directStudent = await User.exists({ _id: submission.student?._id || submission.student, mentor: mentorId });
  if (directStudent) return true;

  // Check if assignment was created by mentor
  const assignment = submission.assignment?._id ? submission.assignment : await Assignment.findById(submission.assignment);
  if (assignment) {
    if (String(assignment.createdBy) === String(mentorId)) return true;
    if (assignment.batch) {
      const mentorBatch = await Batch.exists({ _id: assignment.batch, mentors: mentorId });
      if (mentorBatch) return true;
    }
  }

  return false;
};

/**
 * Helper: Get all submission filter IDs for a mentor
 */
const getMentorSubmissionQuery = async (mentorId) => {
  // 1. Direct assigned students
  const directStudents = await User.find({ role: "student", mentor: mentorId }).select("_id");
  const directStudentIds = directStudents.map((s) => s._id);

  // 2. Batches assigned to mentor
  const batches = await Batch.find({ mentors: mentorId }).select("_id");
  const batchIds = batches.map((b) => b._id);

  // 3. Assignments created by mentor or for their batches
  const assignments = await Assignment.find({
    $or: [
      { createdBy: mentorId },
      { batch: { $in: batchIds } },
    ],
  }).select("_id");
  const assignmentIds = assignments.map((a) => a._id);

  return {
    $or: [
      { student: { $in: directStudentIds } },
      { assignment: { $in: assignmentIds } },
    ],
  };
};

// Create submission (student)
const createSubmission = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { assignment, githubUrl, liveDemoUrl, notes } = req.body;

    if (!assignment || !githubUrl) {
      return res.status(400).json({
        success: false,
        message: "Assignment and GitHub URL are required",
      });
    }

    const assignmentData = await Assignment.findById(assignment);
    if (!assignmentData) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit assignments",
      });
    }

    // Check deadline
    if (new Date() > new Date(assignmentData.deadline)) {
      return res.status(400).json({
        success: false,
        message: "Assignment deadline has passed",
      });
    }

    // Check existing submission
    const existingSubmission = await Submission.findOne({
      assignment,
      student: studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this assignment",
      });
    }

    const submission = await Submission.create({
      assignment,
      student: studentId,
      githubUrl,
      liveDemoUrl,
      notes,
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("student", "name email")
      .populate("assignment", "title deadline maxScore");

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: populatedSubmission,
    });
  } catch (error) {
    console.error("Create submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
      error: error.message,
    });
  }
};

// Get mentor submissions
const getMentorSubmissions = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const query = req.user.role === "admin" ? {} : await getMentorSubmissionQuery(mentorId);

    const submissions = await Submission.find(query)
      .populate("student", "name email")
      .populate("assignment", "title deadline maxScore batch")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Get mentor submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get submissions",
      error: error.message,
    });
  }
};

// Get pending submissions
const getPendingSubmissions = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const baseQuery = req.user.role === "admin" ? {} : await getMentorSubmissionQuery(mentorId);

    const query = {
      ...baseQuery,
      status: "Submitted",
    };

    const submissions = await Submission.find(query)
      .populate("student", "name email")
      .populate("assignment", "title deadline maxScore")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Get pending submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending submissions",
      error: error.message,
    });
  }
};

// Get one submission
const getSubmissionById = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate("student", "name email batch")
      .populate("assignment", "title description instructions deadline maxScore batch");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (req.user.role !== "admin") {
      const hasAccess = await mentorHasAccessToSubmission(mentorId, submission);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this submission",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Get submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get submission",
      error: error.message,
    });
  }
};

// Grade submission
const gradeSubmission = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;
    const { score, feedback, status } = req.body;

    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const submission = await Submission.findById(id).populate("assignment", "maxScore batch createdBy");
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (req.user.role !== "admin") {
      const hasAccess = await mentorHasAccessToSubmission(mentorId, submission);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You cannot grade this submission",
        });
      }
    }

    if (score < 0 || (submission.assignment && score > submission.assignment.maxScore)) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${submission.assignment?.maxScore || 100}`,
      });
    }

    submission.score = score;
    submission.feedback = feedback || "";
    submission.status = status || "Graded";
    submission.gradedBy = mentorId;
    submission.gradedAt = new Date();

    await submission.save();

    const updatedSubmission = await Submission.findById(id)
      .populate("student", "name email")
      .populate("assignment", "title maxScore deadline")
      .populate("gradedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to grade submission",
      error: error.message,
    });
  }
};

// Request resubmission
const requestResubmission = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;
    const { feedback } = req.body;

    const submission = await Submission.findById(id).populate("assignment", "batch createdBy");
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (req.user.role !== "admin") {
      const hasAccess = await mentorHasAccessToSubmission(mentorId, submission);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You cannot request resubmission for this submission",
        });
      }
    }

    submission.status = "Resubmission Required";
    submission.feedback = feedback || "Please revise and resubmit your assignment.";
    submission.gradedBy = mentorId;
    submission.gradedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Resubmission requested successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Request resubmission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request resubmission",
      error: error.message,
    });
  }
};

// Get my submissions (student)
const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.id;

    const submissions = await Submission.find({ student: studentId })
      .populate("assignment", "title description deadline maxScore link batch")
      .populate("gradedBy", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Get my submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your submissions",
      error: error.message,
    });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getMentorSubmissions,
  getPendingSubmissions,
  getSubmissionById,
  gradeSubmission,
  requestResubmission,
};