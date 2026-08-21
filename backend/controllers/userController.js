const User = require("../models/User");
const Batch = require("../models/Batch");

// Get all students

const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    })
      .select("-password")
      .populate("batch", "name track");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Get students error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get students",
      error: error.message,
    });
  }
};
// Get one user

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("batch", "name track");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};
// Get mentor's students

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

    // Find students belonging to those batches

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
    console.error(
      "Get mentor students error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get mentor students",
      error: error.message,
    });
  }
};

module.exports = {
  getStudents,
  getUserById,
  getMentorStudents,
};
