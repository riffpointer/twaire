import express from "express";
import { User, Playlist } from "../models/models.js";
import isAuthenticated from "../middleware/auth.js";
import { apiMessage, apiError } from "../utils/logging.js";

const playlistRouter = express.Router();

// Get playlists for a user
playlistRouter.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Lazy initialization of Watch Later for existing users
    let watchLater = await Playlist.findOne({ owner: user._id, isDefault: true });
    if (!watchLater && (req.session?.userId && req.session.userId.toString() === user._id.toString())) {
      watchLater = new Playlist({
        name: "Watch Later",
        owner: user._id,
        visibility: 2, // 0 = public, 1 = unlisted, 2 = private
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      await watchLater.save();
    }

    const currentUserId = req.session?.userId;
    const isOwner = currentUserId && currentUserId.toString() === user._id.toString();

    const query = { owner: user._id };
    if (!isOwner) {
      query.visibility = 0; // Only public
    }

    const playlists = await Playlist.find(query).populate("videos", "_id title thumbnail uploader duration").populate("owner", "username publicName profilePicture").sort({ isDefault: -1, createdAt: -1 });

    res.json(playlists);
  } catch (err) {
    apiError("GET", `/user/${req.params.username}`, "Failed to fetch playlists:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new playlist
playlistRouter.post("/", isAuthenticated, async (req, res) => {
  try {
    const { name, visibility } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newPlaylist = new Playlist({
      name,
      owner: req.session.userId,
      visibility: visibility || 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await newPlaylist.save();
    res.json(newPlaylist);
  } catch (err) {
    apiError("POST", "/", "Failed to create playlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add video to playlist
playlistRouter.post("/:id/videos", isAuthenticated, async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.owner.toString() !== req.session.userId.toString()) return res.status(403).json({ error: "Forbidden" });

    if (!playlist.videos.includes(videoId)) {
      playlist.videos.push(videoId);
      playlist.updatedAt = Date.now();
      await playlist.save();
    }
    res.json(playlist);
  } catch (err) {
    apiError("POST", `/${req.params.id}/videos`, "Failed to add video:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove video from playlist
playlistRouter.delete("/:id/videos/:videoId", isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.owner.toString() !== req.session.userId.toString()) return res.status(403).json({ error: "Forbidden" });

    playlist.videos = playlist.videos.filter(v => v.toString() !== req.params.videoId);
    playlist.updatedAt = Date.now();
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    apiError("DELETE", `/${req.params.id}/videos/${req.params.videoId}`, "Failed to remove video:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete playlist
playlistRouter.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.owner.toString() !== req.session.userId.toString()) return res.status(403).json({ error: "Forbidden" });
    if (playlist.isDefault) return res.status(400).json({ error: "Cannot delete default playlist" });

    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    apiError("DELETE", `/${req.params.id}`, "Failed to delete playlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update playlist
playlistRouter.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { name, visibility } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.owner.toString() !== req.session.userId.toString()) return res.status(403).json({ error: "Forbidden" });
    if (playlist.isDefault && name && name !== playlist.name) return res.status(400).json({ error: "Cannot rename default playlist" });

    if (name && !playlist.isDefault) playlist.name = name;
    if (visibility !== undefined) playlist.visibility = visibility;
    playlist.updatedAt = Date.now();

    await playlist.save();
    res.json(playlist);
  } catch (err) {
    apiError("PUT", `/${req.params.id}`, "Failed to update playlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single playlist by ID
playlistRouter.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("videos", "_id title thumbnail uploader views uploadedAt")
      .populate("owner", "username publicName profilePicture verified");

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const currentUserId = req.session?.userId;
    const isOwner = currentUserId && currentUserId.toString() === playlist.owner._id.toString();

    if (playlist.visibility === 2 && !isOwner) {
      return res.status(403).json({ error: "This playlist is private" });
    }

    res.json(playlist);
  } catch (err) {
    apiError("GET", `/${req.params.id}`, "Failed to fetch playlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default playlistRouter;
