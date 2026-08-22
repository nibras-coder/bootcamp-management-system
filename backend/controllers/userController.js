const User = require("../models/User");
const Batch = require("../models/Batch");

const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, gender, phone, expertise, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Creating the user. 
    // The role is explicitly set to "mentor".
    // Note: The password string is passed here and will be automatically hashed 
    // using bcrypt by the existing pre("save") hook in your User.js model, 
    // which exactly matches the logic used in your authController's register function.
    const newUser = await User.create({
      name,
      email,
      password,
      role: "mentor",
      mentorRole: req.body.role || "",
      gender,
      phone,
      expertise,
      isActive: status === "Active",
    });

    // Remove password from response
    newUser.password = undefined;

    res.status(201).json({
      success: true,
      message: "Mentor created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create mentor",
      error: error.message,
    });
  }
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
