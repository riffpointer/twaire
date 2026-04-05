import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true, index: true },
    timestampSeconds: { type: Number, required: true, min: 0 },
    note: { type: String, required: true, trim: true, maxlength: 160 },
  },
  { timestamps: true },
);

bookmarkSchema.index({ user: 1, video: 1, timestampSeconds: 1 }, { unique: true });

export default bookmarkSchema;
