const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    target: {
      type: String,
      default: "All Tracks",
    },
    category: {
      type: String,
      enum: ["Document", "Video", "Link", "Cheatsheet", "Code", "Book"],
      default: "Document",
    },
    link: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
