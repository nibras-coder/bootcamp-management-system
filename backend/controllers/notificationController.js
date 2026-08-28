const Notification = require("../models/Notification");
const User = require("../models/User");
const Application = require("../models/Application");
const Assignment = require("../models/assignment");
const Resource = require("../models/Resource");
const Announcement = require("../models/announcement");

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private (Student, Admin, Mentor)
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead = null, type = null } = req.query;
    const userId = req.user.id;

    const query = { recipient: userId };

    if (isRead !== null) {
      query.isRead = isRead === "true";
    }

    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalItems: total,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to get notifications", error: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private (Student, Admin, Mentor)
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: "Failed to get unread count", error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Student, Admin, Mentor)
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to mark this notification" });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.status(200).json({ success: true, message: "Notification marked as read", data: notification });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read", error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (Student, Admin, Mentor)
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: Date.now() } }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read", data: { modifiedCount: result.modifiedCount } });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read", error: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private (Student, Admin, Mentor)
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this notification" });
    }

    await notification.deleteOne();

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification", error: error.message });
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private (Student, Admin, Mentor)
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.deleteMany({ recipient: userId });

    res.status(200).json({ success: true, message: "All notifications deleted", data: { deletedCount: result.deletedCount } });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to delete notifications", error: error.message });
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = async (req, res) => {
  try {
    const { recipient, type, message, batch, metadata, users } = req.body;

    // Validate required fields
    if (!type || !message) {
      return res.status(400).json({ success: false, message: "Type and message are required" });
    }

    const notifications = [];

    // If users array is provided, create notification for each user
    if (users && users.length > 0) {
      for (const userId of users) {
        const notification = await Notification.create({
          recipient: userId,
          sender: req.user.id,
          type,
          message,
          batch: batch || null,
          metadata: metadata || {},
        });
        notifications.push(notification);
      }
    } else if (recipient) {
      // Single recipient
      const notification = await Notification.create({
        recipient,
        sender: req.user.id,
        type,
        message,
        batch: batch || null,
        metadata: metadata || {},
      });
      notifications.push(notification);
    } else {
      return res.status(400).json({ success: false, message: "Recipient or users array is required" });
    }

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ success: false, message: "Failed to create notification", error: error.message });
  }
};

// @desc    Notify students about registration closed
// @route   POST /api/notifications/batch/:batchId/registration-closed
// @access  Private (Admin)
const notifyRegistrationClosed = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { message } = req.body;

    const batch = await User.findById(batchId).populate("students");

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const notifications = [];
    for (const studentId of batch.students) {
      const notification = await Notification.create({
        recipient: studentId,
        sender: req.user.id,
        batch: batchId,
        type: "REGISTRATION_CLOSED",
        message: message || `Registration for ${batch.name} has been closed by admin.`,
        metadata: { batchName: batch.name },
      });
      notifications.push(notification);
    }

    res.status(200).json({
      success: true,
      message: `Notification sent to ${notifications.length} students`,
      data: notifications,
    });
  } catch (error) {
    console.error("Notify registration closed error:", error);
    res.status(500).json({ success: false, message: "Failed to send notifications", error: error.message });
  }
};

// @desc    Notify students about new phase
// @route   POST /api/notifications/batch/:batchId/new-phase
// @access  Private (Admin)
const notifyNewPhase = async (req, res) => {
  try {
    const { batchId, phaseId, phaseName } = req.params;
    const { message } = req.body;

    const batch = await User.findById(batchId).populate("students");

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const notifications = [];
    for (const studentId of batch.students) {
      const notification = await Notification.create({
        recipient: studentId,
        sender: req.user.id,
        batch: batchId,
        type: "PHASE_SUBMITTED",
        message: message || `New phase "${phaseName}" has been added to ${batch.name}.`,
        metadata: {
          batchName: batch.name,
          phaseId,
          phaseName,
        },
      });
      notifications.push(notification);
    }

    res.status(200).json({
      success: true,
      message: `Notification sent to ${notifications.length} students`,
      data: notifications,
    });
  } catch (error) {
    console.error("Notify new phase error:", error);
    res.status(500).json({ success: false, message: "Failed to send notifications", error: error.message });
  }
};

// @desc    Notify admin about new application submission
// @route   POST /api/notifications/application/submitted
// @access  Private (System/Auto)
const notifyAdminAboutSubmission = async (applicationId) => {
  try {
    const application = await Application.findById(applicationId).populate("student batch");
    if (!application) return null;

    // Get all admin users
    const admins = await User.find({ role: "admin" }).select("_id");

    const notifications = [];
    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        sender: application.student._id,
        batch: application.batch._id,
        application: application._id,
        type: "APPLICATION_SUBMITTED",
        message: `${application.student.name} has submitted their application for ${application.batch.name}.`,
        metadata: {
          studentName: application.student.name,
          batchName: application.batch.name,
          studentId: application.student._id,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Notify admin about submission error:", error);
    return null;
  }
};

// @desc    Notify student about phase approval/rejection
// @route   POST /api/notifications/application/reviewed
// @access  Private (System/Auto)
const notifyStudentAboutReview = async (applicationId, status, reviewNotes = "") => {
  try {
    const application = await Application.findById(applicationId).populate("student batch");
    if (!application) return null;

    const notification = await Notification.create({
      recipient: application.student._id,
      sender: application.batch.instructor || application.batch.mentors[0],
      batch: application.batch._id,
      application: application._id,
      type: status === "APPROVED" ? "PHASE_APPROVED" : "PHASE_REJECTED",
      message: status === "APPROVED" 
        ? `Your phase submission for ${application.batch.name} has been approved!`
        : `Your phase submission for ${application.batch.name} has been rejected.`,
      metadata: {
        batchName: application.batch.name,
        status,
        reviewNotes,
      },
    });

    return notification;
  } catch (error) {
    console.error("Notify student about review error:", error);
    return null;
  }
};

// @desc    Notify students and mentor about new assignment
const notifyNewAssignment = async (assignmentId) => {
  try {
    const assignment = await Assignment.findById(assignmentId)
      .populate("batch", "name track students mentors")
      .populate("createdBy", "name email role");

    if (!assignment) return null;

    const notifications = [];
    const senderName = assignment.createdBy?.name || "Admin";

    // Get students in the batch
    if (assignment.batch?.students?.length > 0) {
      for (const studentId of assignment.batch.students) {
        const notification = await Notification.create({
          recipient: studentId,
          sender: assignment.createdBy?._id || assignment.batch.mentors?.[0],
          batch: assignment.batch._id,
          type: "ASSIGNMENT_CREATED",
          message: `${senderName} has created a new assignment: ${assignment.title}`,
          metadata: {
            assignmentTitle: assignment.title,
            batchName: assignment.batch.name,
            createdBy: assignment.createdBy?.name,
          },
        });
        notifications.push(notification);
      }
    }

    // Notify mentor if they created it (so they can track responses)
    if (assignment.createdBy?.role === "mentor" && assignment.batch?.mentors) {
      for (const mentorId of assignment.batch.mentors) {
        // Don't send to self
        if (String(mentorId) !== String(assignment.createdBy._id)) {
          const notification = await Notification.create({
            recipient: mentorId,
            sender: assignment.createdBy._id,
            batch: assignment.batch._id,
            type: "MENTOR_NEW_ASSIGNMENT",
            message: `A new assignment "${assignment.title}" was created for ${assignment.batch.name}`,
            metadata: {
              assignmentTitle: assignment.title,
              batchName: assignment.batch.name,
            },
          });
          notifications.push(notification);
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error("Notify new assignment error:", error);
    return null;
  }
};

// @desc    Notify students about new resource
const notifyNewResource = async (resourceId) => {
  try {
    const resource = await Resource.findById(resourceId)
      .populate("batch", "name track students mentors")
      .populate("uploadedBy", "name email role");

    if (!resource) return null;

    const notifications = [];
    const senderName = resource.uploadedBy?.name || "Admin";

    // Get students in the batch
    if (resource.batch?.students?.length > 0) {
      for (const studentId of resource.batch.students) {
        const notification = await Notification.create({
          recipient: studentId,
          sender: resource.uploadedBy?._id || resource.batch.mentors?.[0],
          batch: resource.batch._id,
          type: "RESOURCE_ADDED",
          message: `${senderName} has uploaded a new learning resource: ${resource.title}`,
          metadata: {
            resourceTitle: resource.title,
            batchName: resource.batch.name,
            uploadedBy: resource.uploadedBy?.name,
          },
        });
        notifications.push(notification);
      }
    }

    // Notify mentor if they uploaded it
    if (resource.uploadedBy?.role === "mentor" && resource.batch?.mentors) {
      for (const mentorId of resource.batch.mentors) {
        if (String(mentorId) !== String(resource.uploadedBy._id)) {
          const notification = await Notification.create({
            recipient: mentorId,
            sender: resource.uploadedBy._id,
            batch: resource.batch._id,
            type: "MENTOR_NEW_RESOURCE",
            message: `A new resource "${resource.title}" was uploaded for ${resource.batch.name}`,
            metadata: {
              resourceTitle: resource.title,
              batchName: resource.batch.name,
            },
          });
          notifications.push(notification);
        }
      }
    }

    return notifications;
  } catch (error) {
    console.error("Notify new resource error:", error);
    return null;
  }
};

// @desc    Notify users about new announcement
const notifyNewAnnouncement = async (announcementId) => {
  try {
    const announcement = await Announcement.findById(announcementId)
      .populate("batch", "name track students mentors")
      .populate("author", "name email role");

    if (!announcement) return null;

    const notifications = [];
    const senderName = announcement.author?.name || "Admin";

    // Notify students in the batch (if batch specified)
    if (announcement.batch?.students?.length > 0) {
      for (const studentId of announcement.batch.students) {
        const notification = await Notification.create({
          recipient: studentId,
          sender: announcement.author?._id || announcement.batch.mentors?.[0],
          batch: announcement.batch._id,
          type: "ANNOUNCEMENT",
          message: `${senderName} has published a new announcement: ${announcement.title}`,
          metadata: {
            announcementTitle: announcement.title,
            announcementContent: announcement.content,
            batchName: announcement.batch.name,
            author: announcement.author?.name,
          },
        });
        notifications.push(notification);
      }
    } else if (!announcement.batch) {
      // All tracks announcement - notify all students
      const allStudents = await User.find({ role: "student" }).select("_id");
      for (const studentId of allStudents) {
        const notification = await Notification.create({
          recipient: studentId._id,
          sender: announcement.author?._id,
          batch: null,
          type: "ANNOUNCEMENT",
          message: `${senderName} has published a new announcement: ${announcement.title}`,
          metadata: {
            announcementTitle: announcement.title,
            announcementContent: announcement.content,
            author: announcement.author?.name,
          },
        });
        notifications.push(notification);
      }
    }

    // Notify mentors in the batch
    if (announcement.batch?.mentors?.length > 0) {
      for (const mentorId of announcement.batch.mentors) {
        const notification = await Notification.create({
          recipient: mentorId,
          sender: announcement.author?._id,
          batch: announcement.batch._id,
          type: "MENTOR_ANNOUNCEMENT",
          message: `${senderName} has published a new announcement: ${announcement.title}`,
          metadata: {
            announcementTitle: announcement.title,
            batchName: announcement.batch.name,
          },
        });
        notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error("Notify new announcement error:", error);
    return null;
  }
};
module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  notifyRegistrationClosed,
  notifyNewPhase,
  notifyAdminAboutSubmission,
  notifyStudentAboutReview,
  notifyNewAssignment,
  notifyNewResource,
  notifyNewAnnouncement,
};