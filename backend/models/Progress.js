const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    topic: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "needs_improvement"],
      default: "not_started",
    },
    notes: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

progressSchema.index({ student: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
