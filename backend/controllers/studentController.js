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
      .select("name email role batch mentor phone gender profilePhoto")
      .populate("batch", "name track startDate endDate")
      .populate("mentor", "name email phone mentorRole expertise profilePhoto");

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Query assignments for student's batch OR created by student's mentor OR global (batch: null)
    const asgOr = [{ batch: null }];
    if (student.batch) asgOr.push({ batch: student.batch._id });
    if (student.mentor) asgOr.push({ createdBy: student.mentor._id || student.mentor });
    const assignmentQuery = { $or: asgOr };

    // Query announcements for student's batch OR authored by student's mentor OR global/students
    const annOr = [
      { batch: null },
      { targetAudience: { $in: ["students", "all"] } },
    ];
    if (student.batch) annOr.push({ batch: student.batch._id });
    if (student.mentor) annOr.push({ author: student.mentor._id || student.mentor });
    const announcementQuery = { $or: annOr };

    const [attendance, progress, assignments, submissions, announcements] =
      await Promise.all([
        Attendance.find({ student: studentId })
          .populate("markedBy", "name email")
          .sort({ date: -1 }),
        Progress.find({ student: studentId })
          .populate("updatedBy", "name")
          .sort({ topic: 1, week: 1 }),
        Assignment.find(assignmentQuery)
          .populate("batch", "name track")
          .populate("createdBy", "name email")
          .sort({ deadline: 1 }),
        Submission.find({ student: studentId })
          .populate("assignment", "title maxScore deadline")
          .populate("gradedBy", "name email")
          .sort({ submittedAt: -1 }),
        Announcement.find(announcementQuery)
          .populate("batch", "name track")
          .populate("author", "name email")
          .sort({ publishDate: -1, createdAt: -1 })
          .limit(10),
      ]);

    const totalAttendance = attendance.length;
    const attended = attendance.filter((item) => item.status === "Present" || item.status === "Late").length;
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
          updatedBy: item.updatedBy?.name || "Mentor",
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
      submissions.map((submission) => [String(submission.assignment?._id || submission.assignment), submission])
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
        gradedBy: submission?.gradedBy || null,
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
          (item) => String(item._id) === String(submission.assignment?._id || submission.assignment)
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
        mentor: student.mentor || null,
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

    const orConditions = [{ deadline: { $gte: new Date() } }];
    if (student.batch) orConditions.push({ batch: student.batch._id });
    if (student.mentor) orConditions.push({ createdBy: student.mentor });

    const assignments = await Assignment.find({
      $and: [
        { deadline: { $gte: new Date() } },
        {
          $or: [
            ...(student.batch ? [{ batch: student.batch._id }] : []),
            ...(student.mentor ? [{ createdBy: student.mentor }] : []),
            { batch: null },
          ],
        },
      ],
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
    const studentId = req.user.id;
    const student = await User.findById(studentId).populate("batch", "track");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

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
      .populate("batch", "name track")
      .sort({ createdAt: -1 });

    const Progress = require("../models/progress");
    const progressRecords = await Progress.find({ student: studentId });
    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.topic] = p;
    });

    const enrichedResources = resources.map((r) => {
      const prog = progressMap[r.title] || progressMap[r._id];
      return {
        ...r.toObject(),
        status: prog?.status || "Not Started",
        notes: prog?.notes || "",
        week: prog?.week || 1,
        progressId: prog?._id || null,
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedResources.length,
      data: enrichedResources,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentDashboard, getStudentSchedule, getStudentResources };
