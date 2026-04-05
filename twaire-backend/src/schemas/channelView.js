import mongoose from "mongoose";

const channelViewSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  { timestamps: false },
);

channelViewSchema.index({ uploader: 1, viewedAt: 1 });

export default channelViewSchema;
