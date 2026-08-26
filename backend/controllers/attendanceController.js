const Attendance = require("../models/attendance");
const User = require("../models/User");
const Batch = require("../models/Batch");

/**
 * Helper: Check if a mentor has access to a student.
 * Supports direct assignment (student.mentor) and batch-based (Batch.mentors).
 */
const mentorOwnsStudent = async (mentorId, studentId) => {
  // Check direct assignment first
  const directStudent = await User.findOne({
    _id: studentId,
    role: "student",
    mentor: mentorId,
  });
  if (directStudent) return directStudent;

  // Fallback: check batch assignment
  const batches = await Batch.find({ mentors: mentorId }).select("_id");
  const batchIds = batches.map((b) => b._id);
  const batchStudent = await User.findOne({
    _id: studentId,
    role: "student",
    batch: { $in: batchIds },
  });
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

// Mark attendance -> mentor
const markAttendance = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { student, batch, date, status, note } = req.body;

    if (!student || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "Student, date and status are required",
      });
    }

    // Verify mentor owns this student (direct OR batch)
    const studentUser = await mentorOwnsStudent(mentorId, student);
    if (!studentUser) {
      return res.status(403).json({
        success: false,
        message: "This student is not assigned to you",
      });
    }

    // Use student's actual batch if none provided
    const actualBatch = batch || studentUser.batch;

    // Check duplicate attendance
    const existingAttendance = await Attendance.findOne({
      student,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    const attendance = await Attendance.create({
      student,
      batch: actualBatch,
      date: new Date(date),
      status,
      note,
      markedBy: mentorId,
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("markedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: populatedAttendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};

// Get attendance for mentor (all their students)
const getMentorAttendance = async (req, res) => {
  try {
    let attendance;

    if (req.user.role === "admin") {
      attendance = await Attendance.find({})
        .populate("student", "name email")
        .populate("batch", "name track")
        .populate("markedBy", "name")
        .sort({ date: -1 });
    } else {
      const mentorId = req.user.id;
      const studentIds = await getMentorStudentIds(mentorId);

      attendance = await Attendance.find({
        student: { $in: studentIds },
      })
        .populate("student", "name email")
        .populate("batch", "name track")
        .populate("markedBy", "name")
        .sort({ date: -1 });
    }

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance",
      error: error.message,
    });
  }
};

// Get one student attendance -> mentor
const getStudentAttendance = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { studentId } = req.params;

    // Check mentor has access to this student
    const student = await mentorOwnsStudent(mentorId, studentId);
    if (!student) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this student",
      });
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate("student", "name email")
      .populate("batch", "name track")
      .sort({ date: -1 });

    const total = attendance.length;
    const present = attendance.filter((r) => r.status === "Present").length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        student,
        totalSessions: total,
        presentSessions: present,
        attendancePercentage: Number(percentage.toFixed(1)),
        records: attendance,
      },
    });
  } catch (error) {
    console.error("Get student attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student attendance",
      error: error.message,
    });
  }
};

// Get my attendance (student)
const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    }).populate("batch", "name track");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("markedBy", "name")
      .sort({ date: -1 });

    const total = attendance.length;
    const present = attendance.filter((r) => r.status === "Present").length;
    const absent = attendance.filter((r) => r.status === "Absent").length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    res.status(200).json({
      success: true,
      count: total,
      data: attendance,
      stats: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          batch: student.batch,
        },
        totalSessions: total,
        presentSessions: present,
        absentSessions: absent,
        attendancePercentage: Number(percentage.toFixed(1)),
        records: attendance,
      },
    });
  } catch (error) {
    console.error("Get my attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your attendance",
      error: error.message,
    });
  }
};

// Update attendance - mentor
const updateAttendance = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;
    const { status, note } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Check mentor owns this student (direct or batch)
    const studentUser = await mentorOwnsStudent(mentorId, attendance.student);
    if (!studentUser) {
      // Fallback: also check batch ownership
      const mentorBatch = await Batch.findOne({
        _id: attendance.batch,
        mentors: mentorId,
      });
      if (!mentorBatch) {
        return res.status(403).json({
          success: false,
          message: "You cannot update this attendance",
        });
      }
    }

    attendance.status = status;
    attendance.note = note;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

module.exports = {
  markAttendance,
  getMentorAttendance,
  getStudentAttendance,
  getMyAttendance,
  updateAttendance,
};