const User = require("../models/User");
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