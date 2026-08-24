const Announcement = require("../models/Announcement");
const Batch = require("../models/Batch");
const User = require("../models/User");

// ==========================================
// CREATE ANNOUNCEMENT
// ==========================================
const createAnnouncement = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const {
      title,
      content,
      targetAudience,
      batch,
      publishDate,
    } = req.body;

    if (!title || !content || !batch) {
      return res.status(400).json({
        success: false,
        message: "Title, content and batch are required",
      });
    }

    // Check mentor is assigned to this batch
    const mentorBatch = await Batch.findOne({
      _id: batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this batch",
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      targetAudience: targetAudience || "students",
      batch,
      author: mentorId,
      publishDate: publishDate || new Date(),
      views: [],
    });

    const populatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate("batch", "name track")
        .populate("author", "name email");

    // Count active students in the batch
    const totalStudents = await User.countDocuments({
      role: "student",
      batch: batch,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: {
        ...populatedAnnouncement.toObject(),
        totalStudents,
        viewedStudents: 0,
        viewPercentage: 0,
      },
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
      error: error.message,
    });
  }
};

// ==========================================
// GET MENTOR ANNOUNCEMENTS
// ==========================================
const getMentorAnnouncements = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find batches assigned to this mentor
    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    // Find announcements
    const announcements = await Announcement.find({
      batch: { $in: batchIds },
    })
      .populate("batch", "name track")
      .populate("author", "name email")
      .populate(
        "views.student",
        "name email"
      )
      .sort({
        publishDate: -1,
      });

    // Add view statistics
    const announcementsWithStats =
      await Promise.all(
        announcements.map(async (announcement) => {
          const totalStudents =
            await User.countDocuments({
              role: "student",
              batch: announcement.batch._id,
              isActive: true,
            });

          const viewedStudents =
            announcement.views?.length || 0;

          const viewPercentage =
            totalStudents > 0
              ? Math.round(
                  (viewedStudents /
                    totalStudents) *
                    100
                )
              : 0;

          return {
            ...announcement.toObject(),
            totalStudents,
            viewedStudents,
            viewPercentage,
          };
        })
      );

    res.status(200).json({
      success: true,
      count: announcementsWithStats.length,
      data: announcementsWithStats,
    });
  } catch (error) {
    console.error(
      "Get announcements error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get announcements",
      error: error.message,
    });
  }
};

// ==========================================
// GET ONE ANNOUNCEMENT
// ==========================================
const getAnnouncementById = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const announcement =
      await Announcement.findById(id)
        .populate("batch", "name track")
        .populate("author", "name email")
        .populate(
          "views.student",
          "name email"
        );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check mentor access
    const mentorBatch =
      await Batch.findOne({
        _id: announcement.batch._id,
        mentors: mentorId,
      });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot access this announcement",
      });
    }

    // Count active students
    const totalStudents =
      await User.countDocuments({
        role: "student",
        batch: announcement.batch._id,
        isActive: true,
      });

    const viewedStudents =
      announcement.views?.length || 0;

    const viewPercentage =
      totalStudents > 0
        ? Math.round(
            (viewedStudents /
              totalStudents) *
              100
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...announcement.toObject(),
        totalStudents,
        viewedStudents,
        viewPercentage,
      },
    });
  } catch (error) {
    console.error(
      "Get announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get announcement",
      error: error.message,
    });
  }
};

// ==========================================
// MARK ANNOUNCEMENT AS VIEWED
// ==========================================
const markAnnouncementAsViewed = async (
  req,
  res
) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    // Find announcement
    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Make sure logged-in user is a student
    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message:
          "Only students can view announcements",
      });
    }

    // Check student belongs to the batch
    if (
      !student.batch ||
      student.batch.toString() !==
        announcement.batch.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a member of this announcement batch",
      });
    }

    // Check if student already viewed it
    const alreadyViewed =
      announcement.views.some(
        (view) =>
          view.student.toString() ===
          studentId.toString()
      );

    // Add view only once
    if (!alreadyViewed) {
      announcement.views.push({
        student: studentId,
        viewedAt: new Date(),
      });

      await announcement.save();
    }

    // Count active students
    const totalStudents =
      await User.countDocuments({
        role: "student",
        batch: announcement.batch,
        isActive: true,
      });

    const viewedStudents =
      announcement.views.length;

    const viewPercentage =
      totalStudents > 0
        ? Math.round(
            (viewedStudents /
              totalStudents) *
              100
          )
        : 0;

    res.status(200).json({
      success: true,
      message: alreadyViewed
        ? "Announcement already viewed"
        : "Announcement marked as viewed",
      data: {
        announcementId: announcement._id,
        viewedStudents,
        totalStudents,
        viewPercentage,
        alreadyViewed,
      },
    });
  } catch (error) {
    console.error(
      "Mark announcement viewed error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to mark announcement as viewed",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE ANNOUNCEMENT
// ==========================================
const updateAnnouncement = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check mentor access
    const mentorBatch =
      await Batch.findOne({
        _id: announcement.batch,
        mentors: mentorId,
      });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot update this announcement",
      });
    }

    const {
      title,
      content,
      targetAudience,
      publishDate,
    } = req.body;

    if (title !== undefined) {
      announcement.title = title;
    }

    if (content !== undefined) {
      announcement.content = content;
    }

    if (targetAudience !== undefined) {
      announcement.targetAudience =
        targetAudience;
    }

    if (publishDate !== undefined) {
      announcement.publishDate =
        publishDate;
    }

    await announcement.save();

    const updatedAnnouncement =
      await Announcement.findById(id)
        .populate("batch", "name track")
        .populate("author", "name email")
        .populate(
          "views.student",
          "name email"
        );

    const totalStudents =
      await User.countDocuments({
        role: "student",
        batch: updatedAnnouncement.batch._id,
        isActive: true,
      });

    const viewedStudents =
      updatedAnnouncement.views?.length || 0;

    const viewPercentage =
      totalStudents > 0
        ? Math.round(
            (viewedStudents /
              totalStudents) *
              100
          )
        : 0;

    res.status(200).json({
      success: true,
      message:
        "Announcement updated successfully",
      data: {
        ...updatedAnnouncement.toObject(),
        totalStudents,
        viewedStudents,
        viewPercentage,
      },
    });
  } catch (error) {
    console.error(
      "Update announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update announcement",
      error: error.message,
    });
  }
};

// DELETE ANNOUNCEMENT

const deleteAnnouncement = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check mentor access
    const mentorBatch =
      await Batch.findOne({
        _id: announcement.batch,
        mentors: mentorId,
      });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot delete this announcement",
      });
    }

    await Announcement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete announcement",
      error: error.message,
    });
  }
};


// EXPORT CONTROLLERS

module.exports = {
  createAnnouncement,
  getMentorAnnouncements,
  getAnnouncementById,
  markAnnouncementAsViewed,
  updateAnnouncement,
  deleteAnnouncement,
};