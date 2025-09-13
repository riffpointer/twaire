import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  filename: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  channel: { type: String, default: "Deleted User" }, // FIXME: ditch this and use uploader instead?
  username: { type: String, default: "ghostuser" },   // lil inspiration from Github
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  uploadedAt: { type: Date, default: Date.now },
  tags: { type: [String], default: [] },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  verified: { type: Boolean, default: false }
});

export default videoSchema;