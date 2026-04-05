import mongoose from "mongoose";
import videoSchema from "../schemas/video.js";
import userSchema from "../schemas/user.js";
import commentSchema from "../schemas/comment.js";
import replySchema from "../schemas/reply.js";
import AutocompleteSchema from "../schemas/autocomplete.js";
import bookmarkSchema from "../schemas/bookmark.js";
import channelViewSchema from "../schemas/channelView.js";
import playlistSchema from "../schemas/playlist.js";

const Video = mongoose.model("Video", videoSchema);
const User = mongoose.model("User", userSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Reply = mongoose.model("Reply", replySchema);
const Autocomplete = mongoose.model("Autocomplete", AutocompleteSchema);
const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
const ChannelView = mongoose.model("ChannelView", channelViewSchema);
const Playlist = mongoose.model("Playlist", playlistSchema);

export { Video, User, Comment, Reply, Autocomplete, Bookmark, ChannelView, Playlist };
