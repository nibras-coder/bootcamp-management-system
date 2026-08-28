const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      unique: true,
    },

    track: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },
    instructor: {
      type: mongoose.Schema.Types.Mixed,
    },
    mentors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    phases: [
      {
        name: { type: String, required: true },
        shortMessage: { type: String, default: "" },
        longMessage: { type: String, default: "" },
        order: { type: Number, required: true },
        deadline: { type: Date },
        fields: [
          {
            name: { type: String, required: true },
            type: { 
              type: String, 
              enum: ["text", "long_text", "url", "file", "number", "email", "checkbox", "select", "phone"], 
              required: true 
            },
            required: { type: Boolean, default: true },
            options: [{ type: String }] // For select types
          }
        ],
        isActive: { type: Boolean, default: true }
      }
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    closeRegistration: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);