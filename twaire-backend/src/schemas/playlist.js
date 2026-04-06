import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  visibility: { type: Number, enum: [0, 1, 2], default: 0 },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },
});

export default playlistSchema;
