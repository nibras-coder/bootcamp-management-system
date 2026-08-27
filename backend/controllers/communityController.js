const Community = require("../models/Community");
const CommunityMessage = require("../models/CommunityMessage");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Batch = require("../models/Batch");
const { emitToCommunity, emitToUser } = require("../socket");


/**
 * Helper: Get all valid student IDs assigned to a mentor.
 * Supports direct assignment (User.mentor = mentorId)
 * and batch assignment (Batch.mentors includes mentorId).
 */
const getMentorAssignedStudentIds = async (mentorId) => {
  const directStudents = await User.find({
    role: "student",
    mentor: mentorId,
  }).select("_id");

  const batches = await Batch.find({ mentors: mentorId }).select("_id");
  const batchIds = batches.map((b) => b._id);

  const batchStudents = await User.find({
    role: "student",
    batch: { $in: batchIds },
  }).select("_id");

  const idSet = new Set();
  directStudents.forEach((s) => idSet.add(String(s._id)));
  batchStudents.forEach((s) => idSet.add(String(s._id)));

  return idSet;
};

/**
 * @desc    Create a new community (Mentor only)
 * @route   POST /api/communities
 * @access  Private (Mentor)
 */
const createCommunity = async (req, res) => {
  try {
    const { name, description, track, members, isPrivate } = req.body;
    const mentorId = req.user.id || req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Community name is required",
      });
    }

    const assignedStudentIds = await getMentorAssignedStudentIds(mentorId);

    // Validate that all requested members are assigned to this mentor
    const memberIds = Array.isArray(members) ? members : [];
    const validMemberIds = [];

    for (const id of memberIds) {
      const sId = String(id);
      if (!assignedStudentIds.has(sId)) {
        return res.status(403).json({
          success: false,
          message: `Unauthorized: Student ${id} is not assigned to you.`,
        });
      }
      validMemberIds.push(id);
    }

    const community = await Community.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      track: track ? track.trim() : "General",
      mentor: mentorId,
      members: validMemberIds,
      isPrivate: !!isPrivate,
    });

    const populated = await Community.findById(community._id)
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      });

    res.status(201).json({
      success: true,
      message: "Community created successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create community",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all accessible communities for current user
 * @route   GET /api/communities
 * @access  Private (Mentor / Student)
 */
const getCommunities = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    let query;
    if (userRole === "mentor") {
      query = { mentor: userId };
    } else if (userRole === "student") {
      query = { members: userId };
    } else if (userRole === "admin") {
      query = {}; // Admin can view all
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const communities = await Community.find(query)
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      data: communities,
    });
  } catch (error) {
    console.error("Get communities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single community details
 * @route   GET /api/communities/:id
 * @access  Private (Mentor owner or Member student)
 */
const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);
    const userRole = req.user.role;

    const community = await Community.findById(id)
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMentor = String(community.mentor._id || community.mentor) === userId;
    const isMember = community.members.some((m) => String(m._id || m) === userId);
    const isAdmin = userRole === "admin";

    if (!isMentor && !isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this community.",
      });
    }

    res.status(200).json({
      success: true,
      data: community,
    });
  } catch (error) {
    console.error("Get community error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch community details",
      error: error.message,
    });
  }
};

/**
 * @desc    Update community details (Mentor owner only)
 * @route   PUT /api/communities/:id
 * @access  Private (Mentor)
 */
const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);
    const { name, description, track } = req.body;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (String(community.mentor) !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the community mentor can edit this community.",
      });
    }

    if (name) community.name = name.trim();
    if (description !== undefined) community.description = description.trim();
    if (track) community.track = track.trim();

    await community.save();

    const updated = await Community.findById(id)
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      });

    res.status(200).json({
      success: true,
      message: "Community updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update community error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update community",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete community and associated messages (Mentor owner only)
 * @route   DELETE /api/communities/:id
 * @access  Private (Mentor)
 */
const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (String(community.mentor) !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the community mentor can delete this community.",
      });
    }

    await Community.findByIdAndDelete(id);
    await CommunityMessage.deleteMany({ community: id });

    res.status(200).json({
      success: true,
      message: "Community and its messages deleted successfully",
    });
  } catch (error) {
    console.error("Delete community error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete community",
      error: error.message,
    });
  }
};

/**
 * @desc    Add or update members in a community (Mentor owner only)
 * @route   POST /api/communities/:id/members
 * @access  Private (Mentor)
 */
const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberIds } = req.body;
    const mentorId = req.user.id || req.user._id;

    if (!Array.isArray(memberIds)) {
      return res.status(400).json({
        success: false,
        message: "memberIds must be an array of student IDs",
      });
    }

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (String(community.mentor) !== String(mentorId) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the community mentor can manage members.",
      });
    }

    const assignedStudentIds = await getMentorAssignedStudentIds(mentorId);

    // Validate that all new member IDs are assigned to this mentor
    for (const sId of memberIds) {
      if (!assignedStudentIds.has(String(sId))) {
        return res.status(403).json({
          success: false,
          message: `Unauthorized: Student ${sId} is not assigned to you.`,
        });
      }
    }

    // Set updated members (deduplicated)
    const existing = new Set(community.members.map((m) => String(m)));
    memberIds.forEach((mId) => existing.add(String(mId)));
    community.members = Array.from(existing);

    await community.save();

    const updated = await Community.findById(id)
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      });

    res.status(200).json({
      success: true,
      message: "Members updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Add members error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add members",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove a member from a community (Mentor owner only)
 * @route   DELETE /api/communities/:id/members/:studentId
 * @access  Private (Mentor)
 */
const removeMember = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const mentorId = req.user.id || req.user._id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (String(community.mentor) !== String(mentorId) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the community mentor can remove members.",
      });
    }

    community.members = community.members.filter(
      (m) => String(m) !== String(studentId)
    );

    await community.save();

    const updated = await Community.findById(id)
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      });

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

/**
 * @desc    Get message history for a community
 * @route   GET /api/communities/:id/messages
 * @access  Private (Mentor owner or Member student)
 */
const getCommunityMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);
    const userRole = req.user.role;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMentor = String(community.mentor) === userId;
    const isMember = community.members.some((m) => String(m) === userId);
    const isAdmin = userRole === "admin";

    if (!isMentor && !isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You cannot read messages from this community.",
      });
    }

    const messages = await CommunityMessage.find({ community: id })
      .populate("sender", "name email role profilePhoto mentorRole")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load messages",
      error: error.message,
    });
  }
};

/**
 * @desc    Send a message in a community
 * @route   POST /api/communities/:id/messages
 * @access  Private (Mentor owner or Member student)
 */
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters",
      });
    }

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const isMentor = String(community.mentor) === String(userId);
    const isMember = community.members.some((m) => String(m) === String(userId));
    const isAdmin = userRole === "admin";

    if (!isMentor && !isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to send messages to this community.",
      });
    }

    const message = await CommunityMessage.create({
      community: id,
      sender: userId,
      content: content.trim(),
    });

    const populatedMessage = await CommunityMessage.findById(message._id)
      .populate("sender", "name email role profilePhoto mentorRole")
      .populate("community", "name track");

    // Emit real-time message to community room
    emitToCommunity(id, "community:message:new", populatedMessage);

    // Create and broadcast persisted notifications for all other authorized participants
    try {
      const recipientIds = new Set();
      if (String(community.mentor) !== String(userId)) {
        recipientIds.add(String(community.mentor));
      }
      community.members.forEach((m) => {
        if (String(m) !== String(userId)) {
          recipientIds.add(String(m));
        }
      });

      const preview = content.trim().length > 120 ? content.trim().substring(0, 117) + "..." : content.trim();

      const notificationDocs = Array.from(recipientIds).map((recId) => ({
        recipient: recId,
        sender: userId,
        community: id,
        message: message._id,
        type: "COMMUNITY_MESSAGE",
        messagePreview: preview,
        isRead: false,
      }));

      if (notificationDocs.length > 0) {
        await Notification.insertMany(notificationDocs);

        // Real-time socket notification to individual recipient user rooms
        notificationDocs.forEach((notif) => {
          emitToUser(notif.recipient, "community:notification:new", {
            ...notif,
            community: {
              _id: community._id,
              name: community.name,
              track: community.track,
            },
            sender: {
              _id: populatedMessage.sender._id,
              name: populatedMessage.sender.name,
              role: populatedMessage.sender.role,
              profilePhoto: populatedMessage.sender.profilePhoto,
            },
            createdAt: new Date(),
          });
        });
      }
    } catch (notifErr) {
      console.error("Error creating notifications:", notifErr);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * @desc    Edit/Update a community message (Sender only)
 * @route   PUT /api/communities/:id/messages/:messageId
 * @access  Private
 */
const updateMessage = async (req, res) => {
  try {
    const { id, messageId } = req.params;
    const { content } = req.body;
    const userId = String(req.user.id || req.user._id);

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters",
      });
    }

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const message = await CommunityMessage.findById(messageId);
    if (!message || String(message.community) !== String(id)) {
      return res.status(404).json({
        success: false,
        message: "Message not found in this community",
      });
    }

    // Strictly verify ownership: only sender can edit their own message
    if (String(message.sender) !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own messages.",
      });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    const populated = await CommunityMessage.findById(messageId)
      .populate("sender", "name email role profilePhoto mentorRole")
      .populate("community", "name track");

    // Broadcast updated message event
    emitToCommunity(id, "community:message:updated", populated);

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a community message (Sender, Mentor owner, or Admin)
 * @route   DELETE /api/communities/:id/messages/:messageId
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  try {
    const { id, messageId } = req.params;
    const userId = String(req.user.id || req.user._id);
    const userRole = req.user.role;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const message = await CommunityMessage.findById(messageId);
    if (!message || String(message.community) !== String(id)) {
      return res.status(404).json({
        success: false,
        message: "Message not found in this community",
      });
    }

    const isSender = String(message.sender) === userId;
    const isMentorOwner = String(community.mentor) === userId;
    const isAdmin = userRole === "admin";

    if (!isSender && !isMentorOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to delete this message.",
      });
    }

    await CommunityMessage.findByIdAndDelete(messageId);
    await Notification.deleteMany({ message: messageId });

    // Broadcast deleted message event
    emitToCommunity(id, "community:message:deleted", {
      messageId,
      communityId: id,
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: { messageId, communityId: id },
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all unread notifications for a community as read
 * @route   PUT /api/communities/:id/read
 * @access  Private
 */
const markCommunityNotificationsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    await Notification.updateMany(
      {
        recipient: userId,
        community: id,
        isRead: false,
      },
      { isRead: true }
    );

    emitToUser(userId, "community:notification:read", {
      communityId: id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      data: { communityId: id },
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Get unread community notification counts for current user
 * @route   GET /api/communities/unread
 * @access  Private
 */
const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const unread = await Notification.find({
      recipient: userId,
      isRead: false,
    })
      .populate("sender", "name email role profilePhoto")
      .populate("community", "name track")
      .sort({ createdAt: -1 });

    const communityCounts = {};
    unread.forEach((n) => {
      const cId = String(n.community?._id || n.community);
      communityCounts[cId] = (communityCounts[cId] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      totalUnread: unread.length,
      communityCounts,
      notifications: unread.slice(0, 50),
    });
  } catch (error) {
    console.error("Get unread notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load unread notifications",
      error: error.message,
    });
  }
};

/**
 * @desc    Get public communities available for students to join
 * @route   GET /api/communities/available
 * @access  Private (Student)
 */
const getAvailableCommunities = async (req, res) => {
  try {
    const userId = String(req.user.id || req.user._id);

    // Find all public (non-private) communities where the student is NOT already a member
    const communities = await Community.find({
      isPrivate: { $ne: true },
      members: { $ne: userId },
    })
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      data: communities,
    });
  } catch (error) {
    console.error("Get available communities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available communities",
      error: error.message,
    });
  }
};

/**
 * @desc    Student joins a public community
 * @route   POST /api/communities/:id/join
 * @access  Private (Student)
 */
const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Only allow joining public communities
    if (community.isPrivate) {
      return res.status(403).json({
        success: false,
        message: "This is a private community. You cannot join without an invitation from the mentor.",
      });
    }

    // Check if already a member
    const alreadyMember = community.members.some(
      (m) => String(m) === userId
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community.",
      });
    }

    community.members.push(userId);
    await community.save();

    const updated = await Community.findById(id)
      .populate("mentor", "name email role mentorRole profilePhoto")
      .populate({
        path: "members",
        select: "name email role batch profilePhoto phone",
        populate: { path: "batch", select: "name track" },
      });

    res.status(200).json({
      success: true,
      message: "Successfully joined the community!",
      data: updated,
    });
  } catch (error) {
    console.error("Join community error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join community",
      error: error.message,
    });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  addMembers,
  removeMember,
  getCommunityMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  markCommunityNotificationsRead,
  getUnreadNotifications,
  getAvailableCommunities,
  joinCommunity,
  getMentorAssignedStudentIds,
};
