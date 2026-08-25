const User = require("../models/User");
const Batch = require("../models/Batch");
const asyncHandler = require("../utils/asyncHandler");

// ======================================================
// GET ALL USERS
// ======================================================

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

// ======================================================
// GET USER BY ID
// ======================================================

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

// ======================================================
// CREATE USER
// ======================================================

const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    fullName,
    email,
    password,
    role,
    batch,
  } = req.body;

  const userName = name || fullName;

  if (!userName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const existing = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already in use",
    });
  }

  const user = await User.create({
    name: userName,
    email: email.toLowerCase().trim(),
    password,
    role,
    batch: batch || null,
  });

  res.status(201).json({
    success: true,
    message: "User created",
    user: user.toObject({
      transform: (_, value) => {
        delete value.password;
        return value;
      },
    }),
  });
});

// ======================================================
// UPDATE USER
// ======================================================

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

  if (name !== undefined || fullName !== undefined) {
    user.name =
      name !== undefined
        ? name
        : fullName;
  }

  if (email !== undefined) {
    user.email = email.toLowerCase().trim();
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
    user: user.toObject({
      transform: (_, value) => {
        delete value.password;
        return value;
      },
    }),
  });
});

// ======================================================
// DELETE USER
// ======================================================

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

// ======================================================
// GET ALL STUDENTS
// ======================================================

const getStudents = async (req, res) => {
  try {
    const filter = {
      role: "student",
    };

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

// ======================================================
// WARN STUDENT
// ======================================================

const warnStudent = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Warning message is required",
      });
    }

    const student = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
      },
      {
        $push: {
          warnings: {
            message,
          },
        },
      },
      {
        new: true,
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warning added successfully",
      data: student,
    });
  } catch (error) {
    console.error("Warn student error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to warn student",
      error: error.message,
    });
  }
};

// ======================================================
// GET STUDENTS ASSIGNED TO LOGGED-IN MENTOR
// ======================================================

const getMentorStudents = async (req, res) => {
  try {
    const batches = await Batch.find({
      mentors: req.user.id,
    }).select("_id name track");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const students = await User.find({
      role: "student",
      batch: {
        $in: batchIds,
      },
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

// ======================================================
// UPLOAD PROFILE PHOTO
// ======================================================

const uploadProfilePhoto = asyncHandler(async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a profile photo.",
      });
    }

    // Check logged-in user
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated.",
      });
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Save uploaded image URL
    const avatarUrl = `/uploads/${req.file.filename}`;

    user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully.",
      data: {
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error(
      "Upload profile photo error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo.",
      error: error.message,
    });
  }
});

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getMentorStudents,
  warnStudent,
  uploadProfilePhoto,
};