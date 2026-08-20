const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "mentor", "student"],
      default: "student",
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    
      announcementNotifications: {
        type: Boolean,
        default: true,
      },
    
      assignmentNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("User", userSchema);