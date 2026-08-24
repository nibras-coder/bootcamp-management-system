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
    },
    target: {
      type: String,
      default: "All Tracks",
    },
    link: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
