const User = require("../models/User");


const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("batch", "name track startDate endDate");

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
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    const { profilePhoto } = req.body;

    if (!profilePhoto) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profilePhoto = profilePhoto;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      data: {
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error(
      "Update profile photo error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update profile photo",
      error: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, gender } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    const updated = await User.findById(userId)
      .select("-password")
      .populate("batch", "name track startDate endDate");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateProfilePhoto,
  updateMyProfile,
};