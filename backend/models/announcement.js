const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    targetAudience: {
      type: String,
      enum: ["students", "all"],
      default: "students",
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    publishDate: {
      type: Date,
      default: Date.now,
    },

    // Students who have viewed this announcement
    views: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);