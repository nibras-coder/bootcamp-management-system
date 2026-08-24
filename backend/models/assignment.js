const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
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

    instructions: {
      type: String,
      trim: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },

    resourceLink: {
      type: String,
      trim: true,
    },

    attachment: {
      fileName: {
        type: String,
        trim: true,
      },
      fileUrl: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Assignment ||
  mongoose.model("Assignment", assignmentSchema);