import express from "express";
import mongoose from "mongoose";
import { Video, User, Comment, Autocomplete } from "../models/models.js";
import { videoUpload } from "../providers/storage.js";
import isAuthenticated from "../middleware/auth.js";

const videoRouter = express.Router();

const updateAutocomplete = async (terms) => {
  try {
    for (const term of terms) {
      if (term && term.length > 2) { // Only process terms with more than 2 characters
        await Autocomplete.findOneAndUpdate(
          { term: term.toLowerCase() },
          { createdAt: Date.now() },
          { $inc: { frequency: 1 } },
          { upsert: true }
        );
      }
    }
  } catch (error) {
    console.error("Error updating autocomplete terms:", error);
  }
};

// POST API: Like a video of specified ID
videoRouter.post('/:id/like', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    // Ensure arrays are always present
    video.likes = Array.isArray(video.likes) ? video.likes : [];
    video.dislikes = Array.isArray(video.dislikes) ? video.dislikes : [];
    const hasLiked = video.likes.map(id => id.toString()).includes(userId);
    if (hasLiked) {
      // Remove like if already liked
      video.likes = video.likes.filter(id => id.toString() !== userId);
    } else {
      // Add like and remove dislike if present
      video.likes.push(userId);
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
    }
    await video.save();

    let liked = false;
    let disliked = false;

    if (userId) {
      liked = video.likes.map(id => id.toString()).includes(userId);
      disliked = video.dislikes.map(id => id.toString()).includes(userId);
    }

    res.json({ likes: video.likes.length, dislikes: video.dislikes.length, liked, disliked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST API: Dislike a video of specified ID
videoRouter.post('/:id/dislike', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    video.likes = Array.isArray(video.likes) ? video.likes : [];
    video.dislikes = Array.isArray(video.dislikes) ? video.dislikes : [];
    const hasDisliked = video.dislikes.map(id => id.toString()).includes(userId);
    if (hasDisliked) {
      // Remove dislike if already disliked
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
    } else {
      // Add dislike and remove like if present
      video.dislikes.push(userId);
      video.likes = video.likes.filter(id => id.toString() !== userId);
    }
    await video.save();

    let liked = false;
    let disliked = false;

    if (userId) {
      liked = video.likes.map(id => id.toString()).includes(userId);
      disliked = video.dislikes.map(id => id.toString()).includes(userId);
    }

    res.json({ likes: video.likes.length, dislikes: video.dislikes.length, liked, disliked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET API: Get like/dislike counts and user reaction status for a video
videoRouter.get('/:id/reactions', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    let liked = false;
    let disliked = false;
    const userId = req.session?.userId?.toString();

    if (userId) {
      liked = video.likes.map(id => id.toString()).includes(userId);
      disliked = video.dislikes.map(id => id.toString()).includes(userId);
    }

    res.json({
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      liked,
      disliked
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get all videos with optional sorting and filtering
videoRouter.get("/", async (req, res) => {
  try {
    const { sort, tag, uploader } = req.query;

    let sortOption = { uploadedAt: -1 };
    if (sort === "trending") sortOption = { views: -1 };

    const query = {};
    if (tag) query.tags = tag;

    // Only add uploader filter if valid ObjectId
    if (uploader && mongoose.Types.ObjectId.isValid(uploader)) {
      query.uploader = new mongoose.Types.ObjectId(uploader);
    }

    const videos = await Video.find(query)
                            .sort(sortOption)
                            .populate("uploader", "_id username publicName verified subscribers profilePicture");
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while retrieving videos" });
  }
});

// API: Increment view and get video details
videoRouter.post("/:id/view", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("uploader", "_id username publicName verified subscribers profilePicture");

    if (!video) return res.status(404).json({ error: "Video not found" });

    // Add uploaderId to response for frontend
    const videoData = video.toObject();
    videoData.uploaderId = video.uploader?._id;

    res.json(videoData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET API: Get comments for a video of specified ID
videoRouter.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.id })
      .populate("user", "username publicName profilePicture verified")
      .populate("replies.user", "username publicName profilePicture verified")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while loading comments" });
  }
});

// POST API: Add a comment to a video of specified ID
videoRouter.post("/:id/comments", isAuthenticated, async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });

    const user = await User.findById(req.session.userId).select("username publicName profilePicture verified");
    if (!user)
      return res.status(404).json({ error: "Comment author does not exist" });

    const comment = new Comment({
      video: req.params.id,
      user: user,
      text: req.body.text,
    });

    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while trying to retrieve comments" });
  }
});

// POST API: Upload a new video with optional thumbnail
videoRouter.post(
  "/",
  isAuthenticated,
  videoUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ error: "Not logged in" });

      const { title, description, tags } = req.body;
      if (!req.files || !req.files.video)
        return res.status(400).json({ error: "No video file provided" });

      if (!title || title.trim().length === 0)
        return res.status(400).json({ error: "Title is required" });

      const videoFile = req.files.video[0];
      const thumbnailFile = req.files.thumbnail?.[0] || null;

      // Parse tags safely
      let sanitizedTags = [];
      if (tags) {
        try {
          sanitizedTags = [...new Set(tags.split(",").map(t => t.trim()).filter(Boolean))];
        } catch {
          sanitizedTags = [];
        }
      }

      const user = await User.findById(userId);
      if (!user) return res.status(401).json({ error: "User not found" });

      const video = new Video({
        title,
        description,
        filename: videoFile.filename,
        thumbnail: thumbnailFile?.filename || "",
        views: 0,
        tags: sanitizedTags,
        uploader: user,
      });

      await video.save();
      
      const autocompleteTerms = new Set();
      video.title.split(/\s+/).forEach(t => autocompleteTerms.add(t.toLowerCase()));
      video.description.split(/\s+/).forEach(t => autocompleteTerms.add(t.toLowerCase()));
      video.tags.forEach(t => autocompleteTerms.add(t.toLowerCase()));
      
      await updateAutocomplete(Array.from(autocompleteTerms));

      // Respond with uploaderId explicitly
      res.json({
        ...video.toObject(),
        uploaderId: userId,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Server error during upload: " + err.message });
    }
  }
);

// GET API: Query videos by title, description, or tags with sorting
videoRouter.get("/search", async (req, res) => {
  try {
    const { q, sort } = req.query;
    if (!q) return res.status(400).json({ error: "Missing search query" });

    await updateAutocomplete([q]);

    let query = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ]
    };

    // TODO: Put under a debug flag
    const terms = await Autocomplete.find({
      term: { $regex: `.*`, $options: "i" }
    })
    .sort({ frequency: -1 })
    .limit(10);

    console.log("New search query added to autocomplete database! All search queries: ");
    terms.forEach(term => {
      console.log("Term: " + term.term);
      console.log("Frequency: " + term.frequency);
      console.log("Created At: " + term.createdAt);
    })

    let sortOption = {};
    if (sort === "date") sortOption = { uploadedAt: -1 };
    else if (sort === "views") sortOption = { views: -1 };
    else sortOption = { relevance: -1 }; // fallback (you can implement textScore if needed)

    const videos = await Video.find(query).sort(sortOption);

    res.json(videos);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error during search: " + err.message });
  }
});

// GET API: Return search autocomplete information
videoRouter.get("/search/autocomplete", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const terms = await Autocomplete.find({
      term: { $regex: `^${q}`, $options: "i" }
    })
    .sort({ frequency: -1 })
    .limit(10); 

    // TODO: Only return terms if the frequency is greater than a popularity threshold e.g 5000
    res.json(terms.map(t => t.term));

  } catch (err) {
    res.status(500).json({error: "Error while retrieving autocomplete info: " + err.message})
  }
});

// GET API: Return details of a single video by ID
videoRouter.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("uploader", "_id username publicName verified");
    if (!video) return res.status(404).json({ error: "Video not found" });

    const videoData = video.toObject();
    videoData.uploaderId = video.uploader?._id;

    res.json(videoData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while retrieving video by id: " + err });
  }
});

export default videoRouter;