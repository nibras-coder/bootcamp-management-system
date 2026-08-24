const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    url: { type: String, default: "", trim: true },
    type: { type: String, default: "Resource", trim: true },
    // "All Tracks" makes the resource available to every student.
    targetTrack: { type: String, default: "All Tracks", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
