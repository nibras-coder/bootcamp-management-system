const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Progress = require("../models/Progress");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Announcement = require("../models/Announcement");

const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).select(
      "name email role batch"
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // We will calculate these from your existing models.
    const attendance = await Attendance.find({
      student: studentId,
    });

    const progress = await Progress.find({
      student: studentId,
    });

    const assignments = await Assignment.find({
      batch: student.batch,
    }).sort({ dueDate: 1 });

    const submissions = await Submission.find({
      student: studentId,
    });

    const announcements = await Announcement.find({
      batch: student.batch,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      student,
      stats: {
        attendance: 0,
        progress: 0,
        assignments: 0,
        averageGrade: 0,
      },
      progressOverview: progress,
      upcomingAssignments: assignments,
      submissions,
      recentAnnouncements: announcements,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard,
};