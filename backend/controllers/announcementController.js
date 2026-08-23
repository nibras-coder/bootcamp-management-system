const Announcement = require("../models/Announcement");
const Batch = require("../models/Batch");
const User = require("../models/User");

// Create announcement

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
        message:
          "Title, content and batch are required",
      });
    }

    // Check mentor is assigned to batch

    const mentorBatch = await Batch.findOne({
      _id: batch,
      mentors: mentorId,
    });

    if (!mentorBatch) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this batch",
      });
    }

    const announcement =
      await Announcement.create({
        title,
        content,
        targetAudience:
          targetAudience || "students",
        batch,
        author: mentorId,
        publishDate:
          publishDate || new Date(),
      });

    const populatedAnnouncement =
      await Announcement.findById(
        announcement._id
      )
        .populate("batch", "name track")
        .populate("author", "name email");

    res.status(201).json({
      success: true,
      message:
        "Announcement created successfully",
      data: populatedAnnouncement,
    });
  } catch (error) {
    console.error(
      "Create announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create announcement",
      error: error.message,
    });
  }
};
// Get mentor announcement

const getMentorAnnouncements = async (
  req,
  res
) => {
  try {
    const mentorId = req.user.id;

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const announcements =
      await Announcement.find({
        batch: {
          $in: batchIds,
        },
      })
        .populate("batch", "name track")
        .populate("author", "name email")
        .sort({
          publishDate: -1,
        });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error(
      "Get announcements error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get announcements",
      error: error.message,
    });
  }
};
// Get one announcement

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
        .populate("author", "name email");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

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

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error(
      "Get announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get announcement",
      error: error.message,
    });
  }
};

const getMyAnnouncements = async (
  req,
  res
) => {
  try {
    // Get logged-in student's ID
    const studentId = req.user.id;

    // Find logged-in student

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    }).populate("batch", "name track");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    // Student must have a batch

    if (!student.batch) {
      return res.status(404).json({
        success: false,
        message:
          "Student is not assigned to a batch",
      });
    }
    // Find announcements for student's batch
  
    const announcements =
      await Announcement.find({
        batch: student.batch._id,
        targetAudience: {
          $in: ["students", "all"],
        },
        publishDate: {
          $lte: new Date(),
        },
      })
        .populate("batch", "name track")
        .populate("author", "name email")
        .sort({
          publishDate: -1,
        });

    res.status(200).json({
      success: true,
      count: announcements.length,

      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          batch: student.batch,
        },

        announcements,
      },
    });
  } catch (error) {
    console.error(
      "Get my announcements error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get your announcements",
      error: error.message,
    });
  }
};
// Update announcement -> Mentor

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
        message:
          "Announcement not found",
      });
    }

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
        .populate("author", "name email");

    res.status(200).json({
      success: true,
      message:
        "Announcement updated successfully",
      data: updatedAnnouncement,
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
// Delete announcement

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
        message:
          "Announcement not found",
      });
    }

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

module.exports = {
  createAnnouncement,
  getMentorAnnouncements,
  getAnnouncementById,
  getMyAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};