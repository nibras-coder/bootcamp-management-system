const User = require("../models/User");
const Batch = require("../models/Batch");
const cloudinary = require("../config/cloudinary");

// Get all users
const getUsers = async (req, res) => {
  res.status(200).json({
    message: "Not implemented yet",
  });
};

// Create user
const createUser = async (req, res) => {
  res.status(200).json({
    message: "Not implemented yet",
  });
};

// Update user
const updateUser = async (req, res) => {
  res.status(200).json({
    message: "Not implemented yet",
  });
};

// Delete user
const deleteUser = async (req, res) => {
  res.status(200).json({
    message: "Not implemented yet",
  });
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

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id name track");

    const batchIds = batches.map(
      (batch) => batch._id
    );

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

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const uploadResult = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "bootcamp-management/profiles",
              public_id: `user-${userId}`,
              overwrite: true,
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        uploadStream.end(req.file.buffer);
      }
    );

    user.avatarUrl = uploadResult.secure_url;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
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
      message: "Failed to upload profile photo",
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
  uploadProfilePhoto,
};