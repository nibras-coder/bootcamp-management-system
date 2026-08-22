const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const asyncHandler = require("../utils/asyncHandler");
const { getMyBatchIds } = require("../middleware/mentorScope");

// GET /api/submissions — mentor sees submissions only for assignments in their batches
const getSubmissions = asyncHandler(async (req, res) => {
  const myBatches = getMyBatchIds(req.user);
  let assignmentIds = null;

  if (myBatches) {
    const assignments = await Assignment.find({ batch: { $in: myBatches } }).select("_id");
    assignmentIds = assignments.map((a) => a._id);
  }

  const query = assignmentIds ? { assignment: { $in: assignmentIds } } : {};
  const submissions = await Submission.find(query)
    .populate("student", "name email")
    .populate("assignment", "title maxScore")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: submissions.length, submissions });
});

// PUT /api/submissions/:id — grade a submission
const gradeSubmission = asyncHandler(async (req, res) => {
  const { score, feedback, status } = req.body;
  const submission = await Submission.findById(req.params.id);
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

  if (score !== undefined) submission.score = score;
  if (feedback !== undefined) submission.feedback = feedback;
  if (status !== undefined) submission.status = status;
  submission.gradedBy = req.user._id;

  await submission.save();
  res.status(200).json({ success: true, message: "Submission graded", submission });
});

module.exports = { getSubmissions, gradeSubmission };
