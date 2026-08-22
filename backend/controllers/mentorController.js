const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const asyncHandler = require("../utils/asyncHandler");
const { getMyBatchIds } = require("../middleware/mentorScope");

// GET /api/mentor/dashboard — combined stats for the mentor dashboard page
const getDashboard = asyncHandler(async (req, res) => {
  const myBatches = getMyBatchIds(req.user) || [];

  const students = await User.find({ role: "student", batch: { $in: myBatches } });
  const studentIds = students.map((s) => s._id);

  const attendanceRecords = await Attendance.find({ student: { $in: studentIds } });
  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const attendanceAvg = attendanceRecords.length
    ? Math.round((presentCount / attendanceRecords.length) * 1000) / 10
    : 0;

  const assignments = await Assignment.find({ batch: { $in: myBatches } }).select("_id");
  const assignmentIds = assignments.map((a) => a._id);

  const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
    .populate("student", "name")
    .populate("assignment", "title");

  const pendingSubmissions = submissions.filter((s) => s.status === "submitted").length;
  const gradedSubmissions = submissions.filter((s) => s.score !== null);
  const averageGrade = gradedSubmissions.length
    ? Math.round((gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length) * 10) / 10
    : 0;

  // Attendance over the last 7 records grouped by date (simplified)
  const last7 = attendanceRecords.slice(-7);

  // Students at risk: below 65% individual attendance
  const perStudentAttendance = studentIds.map((id) => {
    const records = attendanceRecords.filter((r) => String(r.student) === String(id));
    const present = records.filter((r) => r.status === "present").length;
    const pct = records.length ? Math.round((present / records.length) * 100) : 100;
    const student = students.find((s) => String(s._id) === String(id));
    return { name: student?.name || "Unknown", attendance: pct };
  }).filter((s) => s.attendance < 65).sort((a, b) => a.attendance - b.attendance);

  const recentAssignments = submissions
    .filter((s) => s.status === "submitted")
    .slice(0, 5)
    .map((s) => ({
      student: s.student?.name,
      assignment: s.assignment?.title,
      date: s.submittedAt,
      status: s.status,
    }));

  res.status(200).json({
    success: true,
    myStudents: students.length,
    attendanceAvg,
    pendingSubmissions,
    averageGrade,
    attendanceOverTime: last7,
    studentsAtRisk: perStudentAttendance,
    recentAssignments,
  });
});

module.exports = { getDashboard };
