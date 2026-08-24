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
      { name: { $regex: search, $options: "i" } },
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
  const { name, fullName, email, password, role, batch } = req.body;
  const userName = name || fullName;

  if (!userName || !email || !password || !role) {
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
};
// Get mentor's students

  const user = await User.create({
    name: userName,
    email: email.toLowerCase(),
    password,
    role,
    batch,
  });

  res.status(201).json({
    success: true,
    message: "User created",
    user: user.toObject({ transform: (_, value) => {
      delete value.password;
      return value;
    } }),
  });
});

// PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { name, fullName, email, role, batch } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (name !== undefined || fullName !== undefined) {
    user.name = name !== undefined ? name : fullName;
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
    user: user.toObject({ transform: (_, value) => {
      delete value.password;
      return value;
    } }),
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
    const filter = { role: "student" };
    if (req.query.gender) {
      filter.gender = req.query.gender;
    }
    if (req.query.batch) {
      filter.batch = req.query.batch;
    }

    const students = await User.find(filter)
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
const warnStudent = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Warning message is required" });
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      { $push: { warnings: { message } } },
      { new: true }
    ).select("-password");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, message: "Warning added successfully", data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to warn student", error: error.message });
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
  warnStudent,
};
