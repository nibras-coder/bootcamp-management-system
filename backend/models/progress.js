const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Not Started",
        "In Progress",
        "Completed",
        "Needs Improvement",
        "Need Help",
      ],
      default: "Not Started",
    },

    week: {
      type: Number,
      default: 1,
      min: 1,
    },

    notes: {
      type: String,
      trim: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index(
  {
    student: 1,
    topic: 1,
    week: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Progress", progressSchema);