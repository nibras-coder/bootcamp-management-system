const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    track: {
      type: String, // Copied from the batch for easy filtering
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "REJECTED", "ACCEPTED"],
      default: "IN_PROGRESS",
    },
    currentPhaseOrder: {
      type: Number,
      default: 1, // Represents the order of the phase the student is currently on
    },
    submissions: [
      {
        phaseId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        phaseName: {
          type: String,
        },
        data: {
          type: mongoose.Schema.Types.Mixed, // Dynamic fields data
          default: {},
        },
        status: {
          type: String,
          enum: ["PENDING_REVIEW", "APPROVED", "REJECTED"],
          default: "PENDING_REVIEW",
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        reviewedAt: {
          type: Date,
        },
        reviewNotes: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
