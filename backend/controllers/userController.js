const User = require("../models/User");
const Batch = require("../models/Batch");
<<<<<<< HEAD
const asyncHandler = require("../utils/asyncHandler");
const { getMyBatchIds } = require("../middleware/mentorScope");

// GET /api/users  — supports ?role=&search=&batch=&page=&limit=
// Mentors are automatically scoped to only students in their own batches.
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, batch, page = 1, limit = 50 } = req.query;
  const query = {};

  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const myBatches = getMyBatchIds(req.user);
  if (myBatches) {
    // Mentor: only students within their assigned batches
    query.batch = batch ? batch : { $in: myBatches };
  } else if (batch) {
    query.batch = batch;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    users,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.status(200).json({ success: true, user });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, batch } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Full name, email, password, and role are required" });
  }
  if (!["admin", "mentor", "student"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: "A user with this email already exists" });
  }
  const user = await User.create({ name, email, password, role, phone, batch: role === "student" ? batch || null : null });
  if (role === "student" && batch) {
    await Batch.findByIdAndUpdate(batch, { $addToSet: { students: user._id } });
  }
  res.status(201).json({ success: true, message: "User created", user });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, isActive, avatarUrl } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email.toLowerCase();
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (isActive !== undefined) user.isActive = isActive;
  if (role !== undefined) {
    if (!["admin", "mentor", "student"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    user.role = role;
  }
  await user.save();
  res.status(200).json({ success: true, message: "User updated", user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ success: false, message: "You cannot delete your own account" });
  }
  await user.deleteOne();
  await Batch.updateMany({}, { $pull: { students: user._id, mentors: user._id } });
  res.status(200).json({ success: true, message: "User deleted" });
});

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
=======

const getUsers = async (req, res) => {
  res.status(200).json({ message: "Not implemented yet" });
};

const createUser = async (req, res) => {
  res.status(200).json({ message: "Not implemented yet" });
};

const updateUser = async (req, res) => {
  res.status(200).json({ message: "Not implemented yet" });
};

const deleteUser = async (req, res) => {
  res.status(200).json({ message: "Not implemented yet" });
};

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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getUserById,
  getMentorStudents,
};
>>>>>>> origin/main
