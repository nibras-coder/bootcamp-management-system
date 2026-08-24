const User = require("../models/User");
const Batch = require("../models/Batch");
const asyncHandler = require("../utils/asyncHandler");


const getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      {
        fullName: {
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
    users,
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
// Admin creates a user directly

const createUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    role,
    batch,
  } = req.body;

  // Validate required fields
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // Validate role
  const allowedRoles = ["student", "mentor", "admin"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  // Check if email already exists
  const existing = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already in use",
    });
  }

  // If a batch is provided, make sure it exists
  if (batch) {
    const existingBatch = await Batch.findById(batch);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }
  }

  // Create user
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    role,
    batch: batch || null,
  });

  // Remove password before sending response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: userResponse,
  });
});

// Update one user

const updateUser = asyncHandler(async (req, res) => {
  const {
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

  // Update full name
  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  // Update email
  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase();

    // Check if another user already has this email
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

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: userResponse,
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