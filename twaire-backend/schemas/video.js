import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  filename: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  channel: { type: String, default: "Deleted User" }, // FIXME: ditch this and use uploader instead?
  username: { type: String, default: "ghostuser" },   // lil inspiration from Github
  views: { type: Number, default: 0 },
  
  /* These store references to the reaction owners */
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  uploadedAt: { type: Date, default: Date.now },
  tags: { type: [String], default: [] },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  verified: { type: Boolean, default: false },

  /* 0: Public - Visible to every user and on video lists,
     1: Unlisted - Visible to everyone with link, 
     2: Private - Visible to uploader only */
  visibility: { type: Number, default: 0 },
});

export default videoSchema;