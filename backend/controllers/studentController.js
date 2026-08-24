const User = require("../models/User");
const Attendance = require("../models/attendance");
const Progress = require("../models/progress");
const Assignment = require("../models/assignment");
const Submission = require("../models/submission");
const Announcement = require("../models/announcement");
const Resource = require("../models/Resource");

const progressValue = (status) => {
  switch (status) {
    case "Completed":
      return 100;
    case "In Progress":
      return 50;
    case "Needs Improvement":
      return 25;
    default:
      return 0;
  }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId)
      .select("name email role batch profilePhoto")
      .populate("batch", "name track startDate endDate");

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const [attendance, progress, assignments, submissions, announcements] =
      await Promise.all([
        Attendance.find({ student: studentId }).sort({ date: -1 }),
        Progress.find({ student: studentId }).sort({ topic: 1, week: 1 }),
        student.batch
          ? Assignment.find({ batch: student.batch._id }).sort({ deadline: 1 })
          : [],
        Submission.find({ student: studentId }).sort({ submittedAt: -1 }),
        student.batch
          ? Announcement.find({
              batch: student.batch._id,
              targetAudience: { $in: ["students", "all"] },
              publishDate: { $lte: new Date() },
            })
              .sort({ publishDate: -1 })
              .limit(5)
          : [],
      ]);

    const totalAttendance = attendance.length;
    const attended = attendance.filter((item) => item.status === "Present").length;
    const attendancePercentage = totalAttendance
      ? (attended / totalAttendance) * 100
      : 0;

    const topicMap = new Map();
    progress.forEach((item) => {
      const value = progressValue(item.status);
      const current = topicMap.get(item.topic);
      if (!current || new Date(item.updatedAt) >= new Date(current.updatedAt)) {
        topicMap.set(item.topic, {
          id: item._id,
          topic: item.topic,
          status: item.status,
          week: item.week,
          value,
          notes: item.notes || "",
          updatedAt: item.updatedAt,
        });
      }
    });

    const progressOverview = Array.from(topicMap.values());
    const progressPercentage = progressOverview.length
      ? progressOverview.reduce((sum, item) => sum + item.value, 0) /
        progressOverview.length
      : 0;

    const submissionMap = new Map(
      submissions.map((submission) => [String(submission.assignment), submission])
    );

    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = submissionMap.get(String(assignment._id));
      let status = "Pending";
      if (submission) status = submission.status;
      return {
        ...assignment.toObject(),
        submission: submission || null,
        status,
        score: submission?.score ?? null,
        feedback: submission?.feedback || "",
      };
    });

    const graded = submissions.filter(
      (submission) =>
        submission.status === "Graded" &&
        submission.score !== null &&
        submission.score !== undefined
    );

    const gradePairs = graded
      .map((submission) => {
        const assignment = assignments.find(
          (item) => String(item._id) === String(submission.assignment)
        );
        if (!assignment || !assignment.maxScore) return null;
        return (Number(submission.score) / Number(assignment.maxScore)) * 100;
      })
      .filter((value) => value !== null);

    const averageGrade = gradePairs.length
      ? gradePairs.reduce((sum, value) => sum + value, 0) / gradePairs.length
      : 0;

    const now = new Date();
    const upcomingAssignments = assignmentsWithStatus
      .filter((item) => new Date(item.deadline) >= now)
      .slice(0, 5);

    const pendingAssignments = assignmentsWithStatus.filter(
      (item) => item.status === "Pending" || item.status === "Resubmission Required"
    ).length;

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const attendanceThisWeek = attendance
      .filter((item) => new Date(item.date) >= weekStart)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        date: item.date,
        status: item.status,
      }));

    return res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          attendance: Number(attendancePercentage.toFixed(1)),
          attendedSessions: attended,
          totalSessions: totalAttendance,
          progress: Number(progressPercentage.toFixed(1)),
          assignments: assignments.length,
          pendingAssignments,
          averageGrade: Number(averageGrade.toFixed(1)),
        },
        progressOverview,
        upcomingAssignments,
        assignments: assignmentsWithStatus,
        submissions,
        recentAnnouncements: announcements,
        attendanceThisWeek,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStudentSchedule = async (req, res, next) => {
  try {
    const student = await User.findById(req.user.id).populate("batch", "track");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.batch) return res.json([]);

    const assignments = await Assignment.find({
      batch: student.batch._id,
      deadline: { $gte: new Date() },
    }).sort({ deadline: 1 });

    return res.json(
      assignments.map((assignment) => ({
        _id: assignment._id,
        title: assignment.title,
        type: "Assignment deadline",
        startTime: new Date(assignment.deadline).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: new Date(assignment.deadline).toLocaleDateString(),
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getStudentResources = async (req, res, next) => {
  try {
    const student = await User.findById(req.user.id).populate("batch", "track");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const filters = [{ targetTrack: "All Tracks" }];
    if (student.batch?.track) filters.push({ targetTrack: student.batch.track });

    const resources = await Resource.find({ $or: filters }).sort({ createdAt: -1 });
    return res.json(resources);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentDashboard, getStudentSchedule, getStudentResources };
