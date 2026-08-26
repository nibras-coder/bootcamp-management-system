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
      required: false,
    },

    link: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Assignment",
  assignmentSchema
);