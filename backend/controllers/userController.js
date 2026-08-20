const User = require("../models/User");
const Batch = require("../models/Batch");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
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
});

// Admin creates a user directly
const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, batch } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const existing = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already in use",
    });
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role,
    batch,
  });

  res.status(201).json({
    success: true,
    message: "User created",
    user,
  });
});

// PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, role, batch } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (email !== undefined) {
    user.email = email.toLowerCase();
  }

  if (role !== undefined) {
    user.role = role;
  }

  if (batch !== undefined) {
    user.batch = batch;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated",
    user,
  });
});

// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted",
  });
});

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

// Get students assigned to the logged-in mentor
const getMentorStudents = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find batches assigned to this mentor
    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id name track");

    const batchIds = batches.map((batch) => batch._id);

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
    console.error("Get mentor students error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get mentor students",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getMentorStudents,
};