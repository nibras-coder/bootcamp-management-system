const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Community name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Mentor is required"],
      index: true,
    },
    track: {
      type: String,
      trim: true,
      default: "General",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index to quickly search member communities
communitySchema.index({ members: 1 });

module.exports = mongoose.model("Community", communitySchema);
