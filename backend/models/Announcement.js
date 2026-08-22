const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetAudience: {
      type: String,
      enum: ["all", "students", "mentors", "batch"],
      default: "all",
    },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    publishDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
