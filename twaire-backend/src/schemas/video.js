import mongoose from "mongoose";
import { DEFAULT_VIDEO_CATEGORY, VIDEO_CATEGORY_OPTIONS } from "../utils/videoCategories.js";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  category: {
    type: String,
    default: DEFAULT_VIDEO_CATEGORY,
    enum: VIDEO_CATEGORY_OPTIONS.map((option) => option.value),
  },
  filename: { type: String, required: true },
  thumbnail: { type: String, default: null },
  views: { type: Number, default: 0 },
  
  /* These store references to the reaction owners */
  likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  dislikes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },

  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  uploadedAt: { type: Date, default: Date.now, required: true },
  tags: { type: [String], default: [] },
  pinnedCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },

  /* 0: Public - Visible to every user and on video lists,
     1: Unlisted - Visible to everyone with link, 
     2: Private - Visible to uploader only */
  visibility: { type: Number, default: 0, required: true, enum: [0, 1, 2] },
});

export default videoSchema;
