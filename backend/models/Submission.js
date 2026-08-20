const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    githubUrl: {
      type: String,
      required: true,
      trim: true,
    },

    liveDemoUrl: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    score: {
      type: Number,
      min: 0,
      default: null,
    },

    feedback: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Graded",
        "Resubmission Required",
      ],
      default: "Submitted",
    },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gradedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Submission",
  submissionSchema
);