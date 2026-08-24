const User = require("../models/User");
const Batch = require("../models/Batch");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .populate("batch", "name track")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: users.length, data: users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("batch", "name track");

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.status(200).json({ success: true, data: user });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, fullName, email, password, role, batch } = req.body;
  const userName = (name || fullName || "").trim();

  if (!userName || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Name, email, password and role are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(400).json({ success: false, message: "Email already in use" });

  const user = await User.create({
    name: userName,
    email: email.toLowerCase().trim(),
    password,
    role,
    batch: batch || null,
  });

  const safeUser = await User.findById(user._id).select("-password").populate("batch", "name track");
  res.status(201).json({ success: true, message: "User created", data: safeUser });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, fullName, email, role, batch } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  if (name !== undefined || fullName !== undefined) user.name = (name || fullName).trim();
  if (email !== undefined) user.email = email.toLowerCase().trim();
  if (role !== undefined) user.role = role;
  if (batch !== undefined) user.batch = batch || null;

  await user.save();
  const safeUser = await User.findById(user._id).select("-password").populate("batch", "name track");
  res.status(200).json({ success: true, message: "User updated", data: safeUser });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted" });
});

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("batch", "name track");
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get students", error: error.message });
  }
};

const getMentorStudents = async (req, res) => {
  try {
    const batches = await Batch.find({ mentors: req.user.id }).select("_id name track");
    const students = await User.find({ role: "student", batch: { $in: batches.map((b) => b._id) } })
      .select("-password")
      .populate("batch", "name track");
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get mentor students", error: error.message });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getStudents, getMentorStudents };
