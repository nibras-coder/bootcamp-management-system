const User = require("../models/User");
const Batch = require("../models/Batch");
const asyncHandler = require("../utils/asyncHandler");

// Get all users
const getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .populate("batch", "name track")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Get one user by ID
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

// Admin creates a user
const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    fullName,
    email,
    password,
    role,
    batch,
  } = req.body;

  // Support both name and fullName from frontend
  const userName = (name || fullName || "").trim();

  if (!userName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password and role are required",
    });
  }

  const allowedRoles = ["student", "mentor", "admin"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({
    email: normalizedEmail,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already in use",
    });
  }

  // Validate batch if provided
  if (batch) {
    const existingBatch = await Batch.findById(batch);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }
  }

  const user = await User.create({
    name: userName,
    email: normalizedEmail,
    password,
    role,
    batch: batch || null,
  });

  const safeUser = await User.findById(user._id)
    .select("-password")
    .populate("batch", "name track");

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: safeUser,
  });
});

// Update one user
const updateUser = asyncHandler(async (req, res) => {
  const {
    name,
    fullName,
    email,
    role,
    batch,
  } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Support both name and fullName
  if (name !== undefined || fullName !== undefined) {
    user.name = (name || fullName).trim();
  }

  // Update email
  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.params.id },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    user.email = normalizedEmail;
  }

  // Update role
  if (role !== undefined) {
    const allowedRoles = ["student", "mentor", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    user.role = role;
  }

  // Update batch
  if (batch !== undefined) {
    if (batch) {
      const existingBatch = await Batch.findById(batch);

      if (!existingBatch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }
    }

    user.batch = batch || null;
  }

  await user.save();

  const safeUser = await User.findById(user._id)
    .select("-password")
    .populate("batch", "name track");

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: safeUser,
  });
});

// Delete one user
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
    message: "User deleted successfully",
  });
});

// Get all students
const getStudents = asyncHandler(async (req, res) => {
  const students = await User.find({
    role: "student",
  })
    .select("-password")
    .populate("batch", "name track")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

// Get students assigned to logged-in mentor
const getMentorStudents = asyncHandler(async (req, res) => {
  const mentorId = req.user.id;

  const batches = await Batch.find({
    mentors: mentorId,
  }).select("_id name track");

  const batchIds = batches.map((batch) => batch._id);

  const students = await User.find({
    role: "student",
    batch: { $in: batchIds },
  })
    .select("-password")
    .populate("batch", "name track")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getMentorStudents,
};