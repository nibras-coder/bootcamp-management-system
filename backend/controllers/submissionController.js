const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const Batch = require("../models/Batch");

// Create submission

const createSubmission = async (req, res) => {
  try {
    const studentId = req.user.id;

    const {
      assignment,
      githubUrl,
      liveDemoUrl,
      notes,
    } = req.body;

    if (!assignment || !githubUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Assignment and GitHub URL are required",
      });
    }

    // Find assignment

    const assignmentData =await Assignment.findById(assignment);

    if (!assignmentData) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Find student

    const student = await User.findById(
      studentId
    );

    if (
      !student ||
      student.role !== "student"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only students can submit assignments",
      });
    }

    // Make sure student belongs to assignment batch
    if (
      !student.batch ||
      student.batch.toString() !== assignmentData.batch.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this assignment's batch",
      });
    }

    // Check deadline
    if (
      new Date() >
      new Date(assignmentData.deadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Assignment deadline has passed",
      });
    }

    // Check existing submission
    const existingSubmission =
      await Submission.findOne({
        assignment,
        student: studentId,
      });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted this assignment",
      });
    }

    const submission =
      await Submission.create({
        assignment,
        student: studentId,
        githubUrl,
        liveDemoUrl,
        notes,
      });

    const populatedSubmission =
      await Submission.findById(
        submission._id
      )
        .populate(
          "student",
          "name email"
        )
        .populate(
          "assignment",
          "title deadline maxScore"
        );

    res.status(201).json({
      success: true,
      message:
        "Assignment submitted successfully",
      data: populatedSubmission,
    });
  } catch (error) {
    console.error(
      "Create submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to submit assignment",
      error: error.message,
    });
  }
};
// Get mentore submission

const getMentorSubmissions = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;

    // Find mentor's batches
    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // Find assignments belonging to mentor batches
    const assignments =
      await Assignment.find({
        batch: { $in: batchIds },
      }).select("_id");

    const assignmentIds =
      assignments.map(
        (assignment) => assignment._id
      );

    // Find submissions
    const submissions =
      await Submission.find({
        assignment: {
          $in: assignmentIds,
        },
      })
        .populate(
          "student",
          "name email"
        )
        .populate(
          "assignment",
          "title deadline maxScore batch"
        )
        .sort({
          submittedAt: -1,
        });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error(
      "Get mentor submissions error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get submissions",
      error: error.message,
    });
  }
};

// Get pending submissions

const getPendingSubmissions = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const assignments =
      await Assignment.find({
        batch: { $in: batchIds },
      }).select("_id");

    const assignmentIds =
      assignments.map(
        (assignment) => assignment._id
      );

    const submissions =
      await Submission.find({
        assignment: {
          $in: assignmentIds,
        },
        status: "Submitted",
      })
        .populate(
          "student",
          "name email"
        )
        .populate(
          "assignment",
          "title deadline maxScore"
        )
        .sort({
          submittedAt: -1,
        });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error(
      "Get pending submissions error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get pending submissions",
      error: error.message,
    });
  }
};
// Get one submission

const getSubmissionById = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const submission =
      await Submission.findById(id)
        .populate(
          "student",
          "name email batch"
        )
        .populate(
          "assignment",
          "title description instructions deadline maxScore batch"
        );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const mentorBatch =
      await Batch.findOne({
        _id: submission.assignment.batch,
        mentors: mentorId,
      });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot access this submission",
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error(
      "Get submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get submission",
      error: error.message,
    });
  }
};
// Greade submission

const gradeSubmission = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const {
      score,
      feedback,
      status,
    } = req.body;

    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const submission =
      await Submission.findById(id)
        .populate(
          "assignment",
          "maxScore batch"
        );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check mentor owns batch
    const mentorBatch =
      await Batch.findOne({
        _id: submission.assignment.batch,
        mentors: mentorId,
      });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot grade this submission",
      });
    }

    // Validate score
    if (
      score < 0 ||
      score > submission.assignment.maxScore
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Score must be between 0 and ${submission.assignment.maxScore}`,
      });
    }

    submission.score = score;

    submission.feedback =
      feedback || "";

    submission.status =
      status || "Graded";

    submission.gradedBy = mentorId;

    submission.gradedAt = new Date();

    await submission.save();

    const updatedSubmission =
      await Submission.findById(id)
        .populate(
          "student",
          "name email"
        )
        .populate(
          "assignment",
          "title maxScore deadline"
        )
        .populate(
          "gradedBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Submission graded successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error(
      "Grade submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to grade submission",
      error: error.message,
    });
  }
};
// Request resubmission

const requestResubmission = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const { feedback } = req.body;

    const submission =
      await Submission.findById(id)
        .populate(
          "assignment",
          "batch"
        );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const mentorBatch =
      await Batch.findOne({
        _id: submission.assignment.batch,
        mentors: mentorId,
      });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot request resubmission for this submission",
      });
    }

    submission.status =
      "Resubmission Required";

    submission.feedback =
      feedback ||
      "Please revise and resubmit your assignment.";

    submission.gradedBy = mentorId;

    submission.gradedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message:
        "Resubmission requested successfully",
      data: submission,
    });
  } catch (error) {
    console.error(
      "Request resubmission error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to request resubmission",
      error: error.message,
    });
  }
};

module.exports = {
  createSubmission,
  getMentorSubmissions,
  getPendingSubmissions,
  getSubmissionById,
  gradeSubmission,
  requestResubmission,
};