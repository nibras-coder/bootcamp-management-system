const Attendance = require("../models/Attendance");
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
