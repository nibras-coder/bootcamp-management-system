const mongoose = require("mongoose");

const communityMessageSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: [true, "Community is required"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

communityMessageSchema.index({ community: 1, createdAt: 1 });
communityMessageSchema.index({ sender: 1 });

module.exports = mongoose.model("CommunityMessage", communityMessageSchema);

