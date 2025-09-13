import mongoose from "mongoose";
import videoSchema from "../schemas/video.js";
import userSchema from "../schemas/user.js";
import commentSchema from "../schemas/comment.js";
import replySchema from "../schemas/reply.js";

const Video = mongoose.model("Video", videoSchema);
const User = mongoose.model("User", userSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Reply = mongoose.model("Reply", replySchema);

export { Video, User, Comment, Reply };