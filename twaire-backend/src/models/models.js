import mongoose from "mongoose";
import videoSchema from "../schemas/video.js";
import userSchema from "../schemas/user.js";
import commentSchema from "../schemas/comment.js";
import replySchema from "../schemas/reply.js";
import AutocompleteSchema from "../schemas/autocomplete.js";

const Video = mongoose.model("Video", videoSchema);
const User = mongoose.model("User", userSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Reply = mongoose.model("Reply", replySchema);
const Autocomplete = mongoose.model("Autocomplete", AutocompleteSchema);

export { Video, User, Comment, Reply, Autocomplete };