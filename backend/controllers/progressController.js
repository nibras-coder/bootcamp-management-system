const Progress = require("../models/progress");
const User = require("../models/User");
const Batch = require("../models/Batch");

/**
 * Helper: Check if a mentor has access to a student.
 * Supports direct assignment (student.mentor) and batch-based (Batch.mentors).
 */
const mentorOwnsStudent = async (mentorId, studentId) => {
  const directStudent = await User.findOne({
    _id: studentId,
    role: "student",
    mentor: mentorId,
  }).populate("batch", "name track");
  if (directStudent) return directStudent;

  const batches = await Batch.find({ mentors: mentorId }).select("_id");
  const batchIds = batches.map((b) => b._id);
  const batchStudent = await User.findOne({
    _id: studentId,
    role: "student",
    batch: { $in: batchIds },
  }).populate("batch", "name track");
  return batchStudent;
};

/**
 * Helper: Get all student IDs belonging to a mentor.
 */
const getMentorStudentIds = async (mentorId) => {
  const directStudents = await User.find({ role: "student", mentor: mentorId }).select("_id");
  const batches = await Batch.find({ mentors: mentorId }).select("_id");
  const batchIds = batches.map((b) => b._id);
  const batchStudents = await User.find({ role: "student", batch: { $in: batchIds } }).select("_id");

  const allMap = new Map();
  [...directStudents, ...batchStudents].forEach((s) => allMap.set(String(s._id), s._id));
  return Array.from(allMap.values());
};

// CREATE OR UPDATE PROGRESS - MENTOR
const createProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { student, batch, topic, status, week, notes } = req.body;

    if (!student || !topic) {
      return res.status(400).json({
        success: false,
        message: "Student and topic are required",
      });
    }

    const studentUser = await mentorOwnsStudent(mentorId, student);
    if (!studentUser) {
      return res.status(403).json({
        success: false,
        message: "This student is not assigned to you",
      });
    }

    const actualBatch = batch || studentUser.batch?._id || studentUser.batch || null;
    const actualWeek = week || 1;

    // Upsert progress
    let progress = await Progress.findOne({
      student,
      topic,
      week: actualWeek,
    });

    if (progress) {
      if (status !== undefined) progress.status = status;
      if (notes !== undefined) progress.notes = notes;
      progress.updatedBy = mentorId;
      if (actualBatch) progress.batch = actualBatch;
      await progress.save();
    } else {
      progress = await Progress.create({
        student,
        batch: actualBatch,
        topic,
        status: status || "Not Started",
        week: actualWeek,
        notes,
        updatedBy: mentorId,
      });
    }

    const populatedProgress = await Progress.findById(progress._id)
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Progress saved successfully",
      data: populatedProgress,
    });
  } catch (error) {
    console.error("Create progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save progress",
      error: error.message,
    });
  }
};

// STUDENT SELF-UPDATE PROGRESS
const updateMyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { topic, status, week, notes } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can use this endpoint",
      });
    }

    const actualWeek = week || 1;

    let progress = await Progress.findOne({
      student: studentId,
      topic,
      week: actualWeek,
    });

    if (progress) {
      if (status !== undefined) progress.status = status;
      if (notes !== undefined) progress.notes = notes;
      progress.updatedBy = studentId;
      await progress.save();
    } else {
      progress = await Progress.create({
        student: studentId,
        batch: student.batch || null,
        topic,
        status: status || "In Progress",
        week: actualWeek,
        notes,
        updatedBy: studentId,
      });
    }

    const populatedProgress = await Progress.findById(progress._id)
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Your progress has been updated!",
      data: populatedProgress,
    });
  } catch (error) {
    console.error("Student update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update your progress",
      error: error.message,
    });
  }
};

// Get all progress - mentor (for all assigned students)
const getMentorProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const studentIds = await getMentorStudentIds(mentorId);

    const progress = await Progress.find({
      student: { $in: studentIds },
    })
      .populate("student", "name email batch")
      .populate("batch", "name track")
      .populate("updatedBy", "name")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    console.error("Get mentor progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get progress",
      error: error.message,
    });
  }
};

// Get one student progress - mentor
const getStudentProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { studentId } = req.params;

    const student = await mentorOwnsStudent(mentorId, studentId);
    if (!student) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this student",
      });
    }

    const Resource = require("../models/Resource");
    const filters = [
      { target: { $in: ["All Tracks", "all", "All", "students", ""] } },
      { target: { $exists: false } },
      { target: null },
    ];
    if (student.batch?.track) {
      filters.push({ target: new RegExp(student.batch.track, "i") });
      filters.push({ batch: student.batch._id });
    }
    if (student.mentor) {
      filters.push({ uploadedBy: student.mentor });
      filters.push({ target: "My Assigned Students" });
    }

    const resources = await Resource.find({ $or: filters })
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    const progress = await Progress.find({ student: studentId })
      .populate("batch", "name track")
      .populate("updatedBy", "name")
      .sort({ week: 1, createdAt: 1 });

    const progressMap = {};
    progress.forEach((p) => {
      progressMap[p.topic] = p;
    });

    const items = [];
    const seenTopics = new Set();

    resources.forEach((r) => {
      const prog = progressMap[r.title] || progressMap[r._id];
      seenTopics.add(r.title);
      items.push({
        topic: r.title,
        description: r.description,
        target: r.target,
        category: r.category,
        link: r.link,
        fileUrl: r.fileUrl,
        uploadedBy: r.uploadedBy,
        status: prog?.status || "Not Started",
        notes: prog?.notes || "",
        week: prog?.week || 1,
      });
    });

    progress.forEach((p) => {
      if (!seenTopics.has(p.topic)) {
        seenTopics.add(p.topic);
        items.push({
          topic: p.topic,
          status: p.status || "Not Started",
          notes: p.notes || "",
          week: p.week || 1,
        });
      }
    });

    const total = items.length;
    const completed = items.filter((item) => item.status === "Completed").length;
    const inProgress = items.filter((item) => item.status === "In Progress").length;
    const needsImprovement = items.filter(
      (item) => item.status === "Needs Improvement" || item.status === "Need Help"
    ).length;
    const notStarted = items.filter((item) => item.status === "Not Started").length;

    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        student,
        summary: {
          total,
          completed,
          inProgress,
          needsImprovement,
          notStarted,
          completionPercentage: Number(completionPercentage.toFixed(1)),
        },
        progress: items,
      },
    });
  } catch (error) {
    console.error("Get student progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student progress",
      error: error.message,
    });
  }
};

// Get my progress (student)
const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    })
      .populate("batch", "name track")
      .populate("mentor", "name email phone mentorRole");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const progress = await Progress.find({ student: studentId })
      .populate("batch", "name track")
      .populate("updatedBy", "name email")
      .sort({ week: 1, createdAt: 1 });

    const total = progress.length;
    const completed = progress.filter((item) => item.status === "Completed").length;
    const inProgress = progress.filter((item) => item.status === "In Progress").length;
    const needsImprovement = progress.filter(
      (item) => item.status === "Needs Improvement" || item.status === "Need Help"
    ).length;
    const notStarted = progress.filter((item) => item.status === "Not Started").length;

    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          batch: student.batch,
          mentor: student.mentor,
        },
        summary: {
          total,
          completed,
          inProgress,
          needsImprovement,
          notStarted,
          completionPercentage: Number(completionPercentage.toFixed(1)),
        },
        progress,
      },
    });
  } catch (error) {
    console.error("Get my progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your progress",
      error: error.message,
    });
  }
};

// Update progress -> mentor
const updateProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;
    const { status, notes, topic, week } = req.body;

    const progress = await Progress.findById(id);
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    const studentUser = await mentorOwnsStudent(mentorId, progress.student);
    if (!studentUser && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot update this progress",
      });
    }

    if (status !== undefined) progress.status = status;
    if (notes !== undefined) progress.notes = notes;
    if (topic !== undefined) progress.topic = topic;
    if (week !== undefined) progress.week = week;
    progress.updatedBy = mentorId;

    await progress.save();

    const updatedProgress = await Progress.findById(id)
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: updatedProgress,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
};

module.exports = {
  createProgress,
  updateMyProgress,
  getMentorProgress,
  getStudentProgress,
  getMyProgress,
  updateProgress,
};