const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "APPLICATION_SUBMITTED",
        "PHASE_SUBMITTED",
        "PHASE_APPROVED",
        "PHASE_REJECTED",
        "REGISTRATION_CLOSED",
        "REGISTRATION_OPENED",
        "GENERAL_ANNOUNCEMENT",
        "MENTOR_ASSIGNMENT",
        "STUDENT_ENROLLMENT",
        "COMMUNITY_MESSAGE",
        "COMMUNITY_INVITE",
        "SYSTEM_UPDATE",
        "DEADLINE_REMINDER",
        "FILE_UPLOADED",
        "REVIEW_REQUESTED",
      ],
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      phaseId: { type: mongoose.Schema.Types.ObjectId },
      phaseName: { type: String },
      reviewNotes: { type: String },
      fileUrl: { type: String },
      customData: { type: mongoose.Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
