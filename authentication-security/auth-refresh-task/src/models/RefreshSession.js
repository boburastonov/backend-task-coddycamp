import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      default: "Unknown device",
    },
    ip: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RefreshSession", refreshSessionSchema);