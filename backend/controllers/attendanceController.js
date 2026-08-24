const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Batch = require("../models/Batch");

// Mark attendance -> mentor

const markAttendance = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const {
      student,
      batch,
      date,
      status,
      note,
    } = req.body;

    if (!student || !batch || !date || !status) {
      return res.status(400).json({
        success: false,
        message:
          "Student, batch, date and status are required",
      });
    }

    // Check batch belongs to mentor

    const mentorBatch = await Batch.findOne({
      _id: batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this batch",
      });
    }

    // Check student exists and belongs to batch

    const studentUser = await User.findOne({
      _id: student,
      role: "student",
      batch: batch,
    });

    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found in this batch",
      });
    }

    // Check duplicate attendance

    const existingAttendance =
      await Attendance.findOne({
        student,
        date: new Date(date),
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance already marked for this date",
      });
    }

    const attendance = await Attendance.create({
      student,
      batch,
      date: new Date(date),
      status,
      note,
      markedBy: mentorId,
    });

    const populatedAttendance =
      await Attendance.findById(
        attendance._id
      )
        .populate("student", "name email")
        .populate("batch", "name track")
        .populate("markedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: populatedAttendance,
    });
  } catch (error) {
    console.error(
      "Mark attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};
// Get attendance for mentor

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
      const batches = await Batch.find({
        mentors: mentorId,
      }).select("_id");
      const batchIds = batches.map((batch) => batch._id);
      
      attendance = await Attendance.find({
        batch: { $in: batchIds },
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
    console.error(
      "Get attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get attendance",
      error: error.message,
    });
  }
};
// Get one student attendance -> mentor

const getStudentAttendance = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { studentId } = req.params;

    // Find mentor batches

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // Check student belongs to mentor's batch

    const student = await User.findOne({
      _id: studentId,
      role: "student",
      batch: { $in: batchIds },
    }).populate("batch", "name track");

    if (!student) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot access this student",
      });
    }

    const attendance =
      await Attendance.find({
        student: studentId,
      })
        .populate("student", "name email")
        .populate("batch", "name track")
        .sort({ date: -1 });

    // Calculate percentage

    const total = attendance.length;

    const present = attendance.filter(
      (record) =>
        record.status === "Present"
    ).length;

    const percentage =
      total > 0
        ? (present / total) * 100
        : 0;

    res.status(200).json({
      success: true,

      data: {
        student,
        totalSessions: total,
        presentSessions: present,
        attendancePercentage:
          Number(percentage.toFixed(1)),
        records: attendance,
      },
    });
  } catch (error) {
    console.error(
      "Get student attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get student attendance",
      error: error.message,
    });
  }
};
// Get my attendance 


const getMyAttendance = async (req, res) => {
  try {
    // Get the logged-in student's ID from JWT
    const studentId = req.user.id;

    // Check that the logged-in user exists

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

    // Find ONLY the logged-in student's attendance

    const attendance = await Attendance.find({
      student: studentId,
    })
      .populate("student", "name email")
      .populate("batch", "name track")
      .populate("markedBy", "name")
      .sort({ date: -1 });

    // Calculate attendance statistics

    const total = attendance.length;

    const present = attendance.filter(
      (record) =>
        record.status === "Present"
    ).length;

    const absent = attendance.filter(
      (record) =>
        record.status === "Absent"
    ).length;

    const percentage =
      total > 0
        ? (present / total) * 100
        : 0;

    res.status(200).json({
      success: true,

      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          batch: student.batch,
        },

        totalSessions: total,

        presentSessions: present,

        absentSessions: absent,

        attendancePercentage:
          Number(percentage.toFixed(1)),

        records: attendance,
      },
    });
  } catch (error) {
    console.error(
      "Get my attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get your attendance",
      error: error.message,
    });
  }
};
// Update attendance - mentor


const updateAttendance = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const {
      status,
      note,
    } = req.body;

    const attendance =
      await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    // Check mentor owns this batch
    const mentorBatch = await Batch.findOne({
      _id: attendance.batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot update this attendance",
      });
    }

    attendance.status = status;
    attendance.note = note;

    await attendance.save();

    res.status(200).json({
      success: true,
      message:
        "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error(
      "Update attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update attendance",
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