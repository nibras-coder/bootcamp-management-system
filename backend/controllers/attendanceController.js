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

// Mark attendance -> mentor/admin (bulk support)
const markAttendance = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const userRole = req.user.role;
    
    // Support bulk or single. Bulk is { batchId, date, records: [{ student, status, note }] }
    // Single is { student, batch, date, status, note }
    
    let { batchId, date, records } = req.body;

    // Fallback if the frontend is still sending single payload
    if (!records && req.body.student) {
      records = [{
        student: req.body.student,
        status: req.body.status,
        note: req.body.note
      }];
      batchId = batchId || req.body.batch;
    }

    if (!records || !Array.isArray(records) || !date) {
      return res.status(400).json({
        success: false,
        message: "Date and an array of records (student, status) are required",
      });
    }

    const savedRecords = [];
    const errors = [];

    for (const record of records) {
      const { student, status, note } = record;
      if (!student || !status) {
        errors.push({ student, message: "Student and status are required" });
        continue;
      }

      // Verify mentor owns this student (direct OR batch)
      let studentUser = null;
      if (userRole === "admin") {
        studentUser = await User.findById(student);
      } else {
        studentUser = await mentorOwnsStudent(mentorId, student);
      }
      
      if (!studentUser) {
        errors.push({ student, message: "This student is not assigned to you" });
        continue;
      }

      // Use student's actual batch if none provided
      const actualBatch = batchId || studentUser.batch;

      // Check duplicate/existing attendance for that day
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const existingAttendance = await Attendance.findOne({
        student,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      try {
        if (existingAttendance) {
          // Option 1: skip or update. Let's just update if it already exists for this bulk approach
          existingAttendance.status = status;
          if (note) existingAttendance.note = note;
          await existingAttendance.save();
          savedRecords.push(existingAttendance);
        } else {
          // Ensure actualBatch is provided, otherwise Mongo will throw validation error
          if (!actualBatch) {
            errors.push({ student, message: "Student has no assigned batch, and no batch was selected" });
            continue;
          }
          const attendance = await Attendance.create({
            student,
            batch: actualBatch,
            date: new Date(date),
            status,
            note,
            markedBy: mentorId,
          });
          savedRecords.push(attendance);
        }
      } catch (recordError) {
        console.error("Error saving attendance for student", student, recordError.message);
        errors.push({ student, message: recordError.message });
      }
    }

    if (savedRecords.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to mark attendance for all students",
        errors
      });
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${savedRecords.length} students`,
      data: savedRecords,
      errors: errors.length > 0 ? errors : undefined,
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

// Get one student attendance -> mentor/admin
const getStudentAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { studentId } = req.params;

    // Check mentor has access to this student
    let student = null;
    if (userRole === "admin") {
      student = await User.findById(studentId);
    } else {
      student = await mentorOwnsStudent(userId, studentId);
    }
    
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

// Update attendance - mentor/admin
const updateAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;
    const { status, note } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    if (userRole !== "admin") {
      // Check mentor owns this student (direct or batch)
      const studentUser = await mentorOwnsStudent(userId, attendance.student);
      if (!studentUser) {
        // Fallback: also check batch ownership
        const mentorBatch = await Batch.findOne({
          _id: attendance.batch,
          mentors: userId,
        });
        if (!mentorBatch) {
          return res.status(403).json({
            success: false,
            message: "You cannot update this attendance",
          });
        }
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