const User = require("../models/User");


const getMySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "settings"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.settings || {},
    });
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get settings",
      error: error.message,
    });
  }
};


const updateMySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      emailNotifications,
      announcementNotifications,
      assignmentNotifications,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (emailNotifications !== undefined) {
      user.settings.emailNotifications =
        emailNotifications;
    }

    if (
      announcementNotifications !== undefined
    ) {
      user.settings.announcementNotifications =
        announcementNotifications;
    }

    if (
      assignmentNotifications !== undefined
    ) {
      user.settings.assignmentNotifications =
        assignmentNotifications;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: user.settings,
    });
  } catch (error) {
    console.error(
      "Update settings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

module.exports = {
  getMySettings,
  updateMySettings,
};