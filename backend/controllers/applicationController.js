const Application = require("../models/Application");
const Batch = require("../models/Batch");
const User = require("../models/User");

// @desc    Apply to a batch
// @route   POST /api/applications/apply
// @access  Private (Student)
const applyToBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const studentId = req.user.id;

    // Verify batch exists and is active
    const batch = await Batch.findById(batchId);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ success: false, message: "Batch not found or inactive" });
    }

    // Verify student hasn't already applied
    const existingApplication = await Application.findOne({ student: studentId, batch: batchId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: "You have already applied to this batch." });
    }

    // Verify student isn't already in another batch (optional business logic, but let's just enforce they don't apply twice)

    const application = await Application.create({
      student: studentId,
      batch: batchId,
      track: batch.track,
      status: "IN_PROGRESS",
      currentPhaseOrder: 1, // Start at phase 1
    });

    res.status(201).json({ success: true, message: "Application created successfully", data: application });
  } catch (error) {
    console.error("Apply to batch error:", error);
    res.status(500).json({ success: false, message: "Failed to apply", error: error.message });
  }
};

// @desc    Get current student's application for a batch
// @route   GET /api/applications/my-application/:batchId
// @access  Private (Student)
const getMyApplication = async (req, res) => {
  try {
    const { batchId } = req.params;
    const application = await Application.findOne({ student: req.user.id, batch: batchId }).populate('batch');
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("Get my application error:", error);
    res.status(500).json({ success: false, message: "Failed to get application", error: error.message });
  }
};

// @desc    Get all applications for a student
// @route   GET /api/applications/my-applications
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id }).populate('batch');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("Get my applications error:", error);
    res.status(500).json({ success: false, message: "Failed to get applications", error: error.message });
  }
};

// @desc    Submit a phase
// @route   POST /api/applications/:applicationId/submit
// @access  Private (Student)
const submitPhase = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { phaseId, data } = req.body;

    const application = await Application.findOne({ _id: applicationId, student: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "IN_PROGRESS") {
      return res.status(400).json({ success: false, message: `Application is already ${application.status}` });
    }

    const batch = await Batch.findById(application.batch);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    // Find the phase in the batch
    const phase = batch.phases.find(p => p._id.toString() === phaseId);
    if (!phase) {
      return res.status(404).json({ success: false, message: "Phase not found in batch configuration" });
    }

    if (phase.order !== application.currentPhaseOrder) {
      return res.status(400).json({ success: false, message: "This is not your current phase." });
    }

    // Validate deadlines
    if (phase.deadline && new Date() > new Date(phase.deadline)) {
      return res.status(400).json({ success: false, message: "The deadline for this phase has passed." });
    }

    // Check if a submission already exists for this phase and is pending or approved
    const existingSubmission = application.submissions.find(s => s.phaseId.toString() === phaseId);
    if (existingSubmission && (existingSubmission.status === "PENDING_REVIEW" || existingSubmission.status === "APPROVED")) {
      return res.status(400).json({ success: false, message: "You have already submitted this phase and it is pending review or approved." });
    }

    // Basic required field validation
    for (const field of phase.fields) {
      if (field.required && (!data || data[field.name] === undefined || data[field.name] === "")) {
         return res.status(400).json({ success: false, message: `Field ${field.name} is required.` });
      }
    }

    // Add or replace the submission
    if (existingSubmission) {
      existingSubmission.data = data;
      existingSubmission.status = "PENDING_REVIEW";
      existingSubmission.submittedAt = Date.now();
    } else {
      application.submissions.push({
        phaseId: phase._id,
        phaseName: phase.name,
        data,
        status: "PENDING_REVIEW",
      });
    }

    await application.save();

    res.status(200).json({ success: true, message: "Phase submitted successfully", data: application });
  } catch (error) {
    console.error("Submit phase error:", error);
    res.status(500).json({ success: false, message: "Failed to submit phase", error: error.message });
  }
};

// @desc    Get all applications for a batch
// @route   GET /api/applications/batch/:batchId
// @access  Private (Admin)
const getBatchApplications = async (req, res) => {
  try {
    const { batchId } = req.params;
    const applications = await Application.find({ batch: batchId }).populate('student', 'name email profilePhoto');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("Get batch applications error:", error);
    res.status(500).json({ success: false, message: "Failed to get batch applications", error: error.message });
  }
};

// @desc    Review submission (Approve/Reject)
// @route   PUT /api/applications/:applicationId/review
// @access  Private (Admin)
const reviewSubmission = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { phaseId, status, reviewNotes } = req.body; // status: 'APPROVED' or 'REJECTED'

    const application = await Application.findById(applicationId).populate('student');
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "IN_PROGRESS") {
      return res.status(400).json({ success: false, message: `Cannot review an application that is ${application.status}` });
    }

    const submission = application.submissions.find(s => s.phaseId.toString() === phaseId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    submission.status = status;
    submission.reviewNotes = reviewNotes;
    submission.reviewedAt = Date.now();

    const batch = await Batch.findById(application.batch);
    
    if (status === 'REJECTED') {
      application.status = 'REJECTED';
    } else if (status === 'APPROVED') {
      // Determine if there is a next phase
      const activePhases = batch.phases.filter(p => p.isActive).sort((a, b) => a.order - b.order);
      
      const currentPhaseIndex = activePhases.findIndex(p => p._id.toString() === phaseId);
      
      if (currentPhaseIndex === -1) {
         return res.status(400).json({ success: false, message: "Phase is no longer active." });
      }

      if (currentPhaseIndex < activePhases.length - 1) {
        // Move to next phase
        application.currentPhaseOrder = activePhases[currentPhaseIndex + 1].order;
      } else {
        // Final phase approved!
        application.status = 'ACCEPTED';
        
        // Enroll student in batch
        const student = await User.findById(application.student._id);
        student.batch = batch._id;
        student.role = "student"; // just in case
        await student.save();

        if (!batch.students.includes(student._id)) {
          batch.students.push(student._id);
          await batch.save();
        }
      }
    }

    await application.save();

    res.status(200).json({ success: true, message: `Submission ${status.toLowerCase()}`, data: application });
  } catch (error) {
    console.error("Review submission error:", error);
    res.status(500).json({ success: false, message: "Failed to review submission", error: error.message });
  }
};

module.exports = {
  applyToBatch,
  getMyApplication,
  getMyApplications,
  submitPhase,
  getBatchApplications,
  reviewSubmission
};
