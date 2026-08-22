const Announcement = require("../models/Announcement");
const asyncHandler = require("../utils/asyncHandler");
const { getMyBatchIds } = require("../middleware/mentorScope");

const getAnnouncements = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === "mentor") {
    const myBatches = getMyBatchIds(req.user);
    query.$or = [{ batch: { $in: myBatches } }, { author: req.user._id }, { targetAudience: "all" }];
  }
  const announcements = await Announcement.find(query).sort({ publishDate: -1 });
  res.status(200).json({ success: true, count: announcements.length, announcements });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, targetAudience, batch } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: "title and content are required" });
  }
  const announcement = await Announcement.create({
    title, content, targetAudience, batch,
    author: req.user._id,
  });
  res.status(201).json({ success: true, message: "Announcement published", announcement });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
  await announcement.deleteOne();
  res.status(200).json({ success: true, message: "Announcement deleted" });
});

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
