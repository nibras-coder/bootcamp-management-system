const User = require("../models/User");
const Batch = require("../models/Batch");
const Attendance = require("../models/attendance");
const Assignment = require("../models/assignment");
const Submission = require("../models/submission");

const getMentorDashboard = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // =====================================================
    // 1. GET CURRENT MENTOR
    // =====================================================

    const mentor = await User.findById(mentorId).select(
      "_id name email avatarUrl"
    );

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // =====================================================
    // 2. FIND BATCHES ASSIGNED TO THIS MENTOR
    // =====================================================

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id name track");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // =====================================================
    // 3. FIND STUDENTS IN THOSE BATCHES
    // =====================================================

    const students = await User.find({
      role: "student",
      batch: { $in: batchIds },
    })
      .select(
        "_id name email avatarUrl gender batch"
      )
      .populate("batch", "name track");

    const studentIds = students.map(
      (student) => student._id
    );

    // =====================================================
    // 4. GET ALL ATTENDANCE
    // =====================================================

    const attendance = await Attendance.find({
      student: { $in: studentIds },
    }).sort({
      date: 1,
    });

    // =====================================================
    // 5. OVERALL ATTENDANCE
    // =====================================================

    const totalAttendance =
      attendance.length;

    const presentAttendance =
      attendance.filter(
        (record) =>
          record.status === "Present" ||
          record.status === "Late"
      ).length;

    const attendancePercentage =
      totalAttendance > 0
        ? (presentAttendance /
            totalAttendance) *
          100
        : 0;

    // =====================================================
    // 6. ATTENDANCE CHART - LAST 7 DAYS
    // =====================================================

    const attendanceChart = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date(today);

      currentDate.setDate(
        today.getDate() - i
      );

      // Start of day
      const startOfDay = new Date(
        currentDate
      );

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      // End of day
      const endOfDay = new Date(
        currentDate
      );

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      const dailyAttendance =
        attendance.filter(
          (record) => {
            const recordDate =
              new Date(record.date);

            return (
              recordDate >= startOfDay &&
              recordDate <= endOfDay
            );
          }
        );

      const dailyTotal =
        dailyAttendance.length;

      const dailyPresent =
        dailyAttendance.filter(
          (record) =>
            record.status ===
              "Present" ||
            record.status === "Late"
        ).length;

      const dailyPercentage =
        dailyTotal > 0
          ? (dailyPresent /
              dailyTotal) *
            100
          : 0;

      attendanceChart.push({
        day: currentDate.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),

        value: Number(
          dailyPercentage.toFixed(1)
        ),
      });
    }

    // =====================================================
    // 7. STUDENTS AT RISK
    // =====================================================

    const studentsAtRisk = [];

    for (const student of students) {
      const studentAttendance =
        attendance.filter(
          (record) =>
            record.student.toString() ===
            student._id.toString()
        );

      if (
        studentAttendance.length ===
        0
      ) {
        continue;
      }

      const studentPresent =
        studentAttendance.filter(
          (record) =>
            record.status ===
              "Present" ||
            record.status === "Late"
        ).length;

      const studentAttendancePercentage =
        (studentPresent /
          studentAttendance.length) *
        100;

      if (
        studentAttendancePercentage < 70
      ) {
        studentsAtRisk.push({
          _id: student._id,
          name: student.name,
          email: student.email,
          avatarUrl:
            student.avatarUrl,

          attendancePercentage:
            Number(
              studentAttendancePercentage.toFixed(
                1
              )
            ),
        });
      }
    }

    // =====================================================
    // 8. RECENT ASSIGNMENTS
    // =====================================================

    const recentAssignments =
      await Assignment.find({
        batch: { $in: batchIds },
      })
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "batch",
          "name track"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);

    // =====================================================
    // 9. GET SUBMISSIONS
    // =====================================================

    const submissions =
      await Submission.find({
        student: {
          $in: studentIds,
        },
      })
        .populate(
          "student",
          "name email avatarUrl"
        )
        .populate(
          "assignment",
          "title maxScore deadline batch"
        )
        .sort({
          submittedAt: -1,
        });

    // =====================================================
    // 10. PENDING GRADING
    // =====================================================

    const pendingGrading =
      submissions.filter(
        (submission) =>
          submission.status ===
          "Submitted"
      );

    // =====================================================
    // 11. AVERAGE GRADE
    // =====================================================

    const gradedSubmissions =
      submissions.filter(
        (submission) =>
          submission.score !== null &&
          submission.score !== undefined &&
          submission.assignment &&
          submission.assignment.maxScore >
            0
      );

    let averageGrade = 0;

    if (
      gradedSubmissions.length > 0
    ) {
      const totalPercentage =
        gradedSubmissions.reduce(
          (total, submission) => {
            const percentage =
              (submission.score /
                submission.assignment
                  .maxScore) *
              100;

            return (
              total + percentage
            );
          },
          0
        );

      averageGrade =
        totalPercentage /
        gradedSubmissions.length;
    }

    // =====================================================
    // 12. SEND DASHBOARD DATA
    // =====================================================

    res.status(200).json({
      success: true,

      data: {
        // Mentor
        mentor: {
          _id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          avatarUrl:
            mentor.avatarUrl,
        },

        // Statistics
        studentsCount:
          students.length,

        attendancePercentage:
          Number(
            attendancePercentage.toFixed(
              1
            )
          ),

        pendingSubmissions:
          pendingGrading.length,

        averageGrade:
          Number(
            averageGrade.toFixed(1)
          ),

        // Attendance chart
        attendanceChart,

        // Batches
        batches,

        // Students at risk
        studentsAtRisk,

        // Assignments
        recentAssignments,

        // Pending grading
        pendingGrading,
      },
    });
  } catch (error) {
    console.error(
      "Mentor dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load mentor dashboard",
      error: error.message,
    });
  }
};

// =========================================================
// GET MENTOR STUDENTS
// =========================================================

const getMentorStudents = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;

    const batches = await Batch.find({
      mentors: mentorId,
    }).select(
      "_id name track"
    );

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const students = await User.find({
      role: "student",
      batch: {
        $in: batchIds,
      },
    })
      .select("-password")
      .populate(
        "batch",
        "name track"
      );

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(
      "Get mentor students error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get mentor students",
    });
  }
};
const getMentorBatches = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id name track");

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    console.error("Get mentor batches error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get mentor batches",
    });
  }
};

module.exports = {
  getMentorDashboard,
  getMentorStudents,
  getMentorBatches,
};