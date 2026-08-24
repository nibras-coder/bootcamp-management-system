const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      match: [/^\S+@astu\.edu\.et$/i, "Please use a valid ASTU email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
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

    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male",
    },

    phone: {
      type: String,
      default: "",
    },

    expertise: {
      type: [String],
      default: [],
    },

    mentorRole: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password during login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);