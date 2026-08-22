const User = require("../models/User");
<<<<<<< HEAD
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
=======
const Batch = require("../models/Batch");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const getMentorDashboard = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // 1. Find batches assigned to mentor

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id name");

    const batchIds = batches.map((batch) => batch._id);

    // 2. Find students in those batches

    const students = await User.find({
      role: "student",
      batch: { $in: batchIds },
    }).select("-password");

    const studentIds = students.map(
      (student) => student._id
    );
    // 3. Get attendance
  
    const attendance = await Attendance.find({
      student: { $in: studentIds },
    });

    const totalAttendance = attendance.length;

    const presentAttendance = attendance.filter(
      (record) =>
        record.status === "Present" ||
        record.status === "Late"
    ).length;

    const attendancePercentage =
      totalAttendance > 0
        ? (presentAttendance / totalAttendance) * 100
        : 0;

    // 4. Get assignments

    const assignments = await Assignment.find({
      batch: { $in: batchIds },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Get submissions

    const submissions = await Submission.find({
      student: { $in: studentIds },
    })
      .populate("student", "name email")
      .populate(
        "assignment",
        "title maxScore deadline"
      )
      .sort({ submittedAt: -1 });

    // 6. Pending submissions
  
    const pendingSubmissions = submissions.filter(
      (submission) =>
        submission.status === "Submitted"
    );

    // 7. Average grade

    const gradedSubmissions = submissions.filter(
      (submission) =>
        submission.score !== null &&
        submission.assignment
    );

    let averageGrade = 0;

    if (gradedSubmissions.length > 0) {
      const totalPercentage =
        gradedSubmissions.reduce(
          (total, submission) => {
            return (
              total +
              (submission.score /
                submission.assignment.maxScore) *
                100
            );
          },
          0
        );

      averageGrade =
        totalPercentage /
        gradedSubmissions.length;
    }

    // 8. Send dashboard response

    res.status(200).json({
      success: true,

      data: {
        studentsCount: students.length,

        attendancePercentage: Number(
          attendancePercentage.toFixed(1)
        ),

        pendingSubmissions:
          pendingSubmissions.length,

        averageGrade: Number(
          averageGrade.toFixed(1)
        ),

        batches,

        recentAssignments: assignments,

        pendingGrading: pendingSubmissions,
      },
    });
  } catch (error) {
    console.error(
      "Mentor dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load mentor dashboard",
      error: error.message,
    });
  }
};
const getMentorStudents = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find batches assigned to this mentor

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id name track");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // Find only students belonging to those batches

    const students = await User.find({
      role: "student",
      batch: { $in: batchIds },
    })
      .select("-password")
      .populate("batch", "name track");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Get mentor students error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get mentor students",
    });
  }
};

module.exports = {
  getMentorDashboard,
  getMentorStudents,
};
>>>>>>> origin/main
