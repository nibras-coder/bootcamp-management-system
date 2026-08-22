const Attendance = require("../models/Attendance");
<<<<<<< HEAD
const asyncHandler = require("../utils/asyncHandler");
const { getMyBatchIds } = require("../middleware/mentorScope");

// GET /api/attendance?date=2026-05-15&batch=xxx
const getAttendance = asyncHandler(async (req, res) => {
  const { date, batch } = req.query;
  const query = {};

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
  }

  const myBatches = getMyBatchIds(req.user);
  if (myBatches) {
    query.batch = batch ? batch : { $in: myBatches };
  } else if (batch) {
    query.batch = batch;
  }

  const records = await Attendance.find(query).populate("student", "name email");
  res.status(200).json({ success: true, records });
});

// GET /api/attendance/history?student=xxx
const getStudentHistory = asyncHandler(async (req, res) => {
  const { student } = req.query;
  if (!student) return res.status(400).json({ success: false, message: "student query param is required" });

  const records = await Attendance.find({ student }).sort({ date: -1 });
  const presentCount = records.filter((r) => r.status === "present").length;
  const percentage = records.length ? Math.round((presentCount / records.length) * 100) : 0;

  res.status(200).json({ success: true, records, percentage });
});

// POST /api/attendance — bulk save for one day. body: { batch, date, entries: [{ student, status }] }
const markAttendance = asyncHandler(async (req, res) => {
  const { batch, date, entries } = req.body;
  if (!batch || !date || !Array.isArray(entries)) {
    return res.status(400).json({ success: false, message: "batch, date, and entries are required" });
  }

  const results = await Promise.all(
    entries.map((entry) =>
      Attendance.findOneAndUpdate(
        { student: entry.student, date: new Date(date) },
        { student: entry.student, batch, date: new Date(date), status: entry.status, markedBy: req.user._id },
        { upsert: true, new: true }
      )
    )
  );

  res.status(200).json({ success: true, message: "Attendance saved", records: results });
});

module.exports = { getAttendance, getStudentHistory, markAttendance };
=======
const User = require("../models/User");
const Batch = require("../models/Batch");

// Mark Attendance

const markAttendance = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const {
      student,
      batch,
      date,
      status,
      note,
    } = req.body;

    if (!student || !batch || !date || !status) {
      return res.status(400).json({
        success: false,
        message:
          "Student, batch, date and status are required",
      });
    }

    // Check batch belongs to mentor

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

    // Check student exists and belongs to batch

    const studentUser = await User.findOne({
      _id: student,
      role: "student",
      batch: batch,
    });

    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found in this batch",
      });
    }

    // Check duplicate attendance

    const existingAttendance =
      await Attendance.findOne({
        student,
        date: new Date(date),
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance already marked for this date",
      });
    }

    const attendance = await Attendance.create({
      student,
      batch,
      date: new Date(date),
      status,
      note,
      markedBy: mentorId,
    });

    const populatedAttendance =
      await Attendance.findById(
        attendance._id
      )
        .populate("student", "name email")
        .populate("batch", "name track")
        .populate("markedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: populatedAttendance,
    });
  } catch (error) {
    console.error(
      "Mark attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};
   //Get Attendance for mentor

const getMentorAttendance = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const attendance = await Attendance.find({
      batch: { $in: batchIds },
    })
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("markedBy", "name")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(
      "Get attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get attendance",
      error: error.message,
    });
  }
};
// Get one student attendance

const getStudentAttendance = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { studentId } = req.params;

    // Find mentor batches

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // Check student belongs to mentor

    const student = await User.findOne({
      _id: studentId,
      role: "student",
      batch: { $in: batchIds },
    }).populate("batch", "name track");

    if (!student) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot access this student",
      });
    }

    const attendance =
      await Attendance.find({
        student: studentId,
      })
        .populate("student", "name email")
        .populate("batch", "name track")
        .sort({ date: -1 });

    // Calculate percentage

    const total = attendance.length;

    const present = attendance.filter(
      (record) =>
        record.status === "Present"
    ).length;

    const percentage =
      total > 0
        ? (present / total) * 100
        : 0;

    res.status(200).json({
      success: true,

      data: {
        student,
        totalSessions: total,
        presentSessions: present,
        attendancePercentage:
          Number(percentage.toFixed(1)),
        records: attendance,
      },
    });
  } catch (error) {
    console.error(
      "Get student attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get student attendance",
      error: error.message,
    });
  }
};
// Update attendance

const updateAttendance = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const {
      status,
      note,
    } = req.body;

    const attendance =
      await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Check mentor owns this batch
    
    const mentorBatch = await Batch.findOne({
      _id: attendance.batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot update this attendance",
      });
    }

    attendance.status = status;
    attendance.note = note;

    await attendance.save();

    res.status(200).json({
      success: true,
      message:
        "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(
      "Update attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update attendance",
      error: error.message,
    });
  }
};

module.exports = {
  markAttendance,
  getMentorAttendance,
  getStudentAttendance,
  updateAttendance,
};
>>>>>>> origin/main
