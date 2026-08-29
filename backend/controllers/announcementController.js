const Announcement = require("../models/announcement");
const Batch = require("../models/Batch");
const User = require("../models/User");
const { notifyNewAnnouncement } = require("./notificationController");

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

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message:
          "Title and content are required",
      });
    }

    let actualBatch = batch === "all" ? null : (batch || null);

    if (req.user.role !== 'admin') {
      if (!actualBatch) {
        // Mentors posting global announcements
      } else {
        const mentorBatch = await Batch.findOne({
          _id: actualBatch,
          mentors: req.user.id,
        });

        if (!mentorBatch) {
          return res.status(403).json({
            success: false,
            message: "You cannot create announcements or assignments for a batch you do not mentor.",
          });
        }
      }
    }

    const announcement =
      await Announcement.create({
        title,
        content,
        targetAudience:
          targetAudience || "students",
        batch: actualBatch,
        author: mentorId,
        publishDate:
          publishDate || new Date(),
      });

    // Notify students and mentors about the new announcement
    try {
      await notifyNewAnnouncement(announcement._id);
    } catch (notifyError) {
      console.error("Failed to send announcement notification:", notifyError);
      // Don't fail the request if notification fails
    }

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
// Get mentor announcements (batch-based + authored by mentor)
const getMentorAnnouncements = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const batches = await Batch.find({ mentors: mentorId }).select("_id");
    const batchIds = batches.map((b) => b._id);

    const announcements = await Announcement.find({
      $or: [
        { batch: { $in: batchIds } },
        { author: mentorId },
      ],
    })
      .populate("batch", "name track")
      .populate("author", "name email")
      .sort({ publishDate: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get announcements",
      error: error.message,
    });
  }
};
// Get all announcements (for admin)
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("batch", "name track")
      .populate("author", "name email")
      .sort({ publishDate: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get all announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all announcements",
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

const getMyAnnouncements = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).populate("batch", "name track");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const orConditions = [];
    if (student.batch) orConditions.push({ batch: student.batch._id });
    if (student.mentor) orConditions.push({ author: student.mentor }); // announcements from their assigned mentor
    orConditions.push({ batch: null });
    orConditions.push({ targetAudience: { $in: ["students", "all"] } });

    const filter = { $or: orConditions };

    const announcements = await Announcement.find(filter)
      .populate("batch", "name track")
      .populate("author", "name email")
      .sort({
        publishDate: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        batch: student.batch,
      },
    });
  } catch (error) {
    console.error("Get my announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your announcements",
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

    // Check mentor is the author or owns the batch
    if (req.user.role !== "admin") {
      const isAuthor = String(announcement.author) === String(mentorId);
      if (!isAuthor) {
        if (!announcement.batch) {
          return res.status(403).json({
            success: false,
            message: "You cannot update this announcement",
          });
        }
        const mentorBatch = await Batch.findOne({
          _id: announcement.batch,
          mentors: mentorId,
        });
        if (!mentorBatch) {
          return res.status(403).json({
            success: false,
            message: "You cannot update this announcement",
          });
        }
      }
    }

    const {
      title,
      content,
      targetAudience,
      publishDate,
      batch,
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

    if (batch !== undefined) {
      announcement.batch = batch;
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

    // Check mentor is author or owns batch
    if (req.user.role !== "admin") {
      const isAuthor = String(announcement.author) === String(mentorId);
      if (!isAuthor) {
        if (!announcement.batch) {
          return res.status(403).json({
            success: false,
            message: "You cannot delete this announcement",
          });
        }
        const mentorBatch = await Batch.findOne({
          _id: announcement.batch,
          mentors: mentorId,
        });
        if (!mentorBatch) {
          return res.status(403).json({
            success: false,
            message: "You cannot delete this announcement",
          });
        }
      }
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

const markAnnouncementRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    if (!announcement.readBy) {
      announcement.readBy = [];
    }

    const alreadyRead = announcement.readBy.some((id) => String(id) === String(userId));
    if (!alreadyRead) {
      announcement.readBy.push(userId);
      await announcement.save();
    }

    res.status(200).json({
      success: true,
      message: "Announcement marked as read",
    });
  } catch (error) {
    console.error("Mark announcement read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark announcement as read",
      error: error.message,
    });
  }
};

module.exports = {
  createAnnouncement,
  getMentorAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  getMyAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementRead,
};