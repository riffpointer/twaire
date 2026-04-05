import express from "express";
import mongoose from "mongoose";
import { Video, User, Comment, Autocomplete, Bookmark, ChannelView } from "../models/models.js";
import { videoUpload } from "../providers/storage.js";
import isAuthenticated from "../middleware/auth.js";
import { apiError, apiMessage } from "../utils/logging.js";
import { DEFAULT_VIDEO_CATEGORY, isVideoCategory, sanitizeVideoCategory } from "../utils/videoCategories.js";

const videoRouter = express.Router();

const sanitizeAutocompleteToken = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const extractAutocompleteTerms = (...values) => {
  const terms = new Set();
  for (const value of values.flat()) {
    String(value || "")
      .split(/[^a-zA-Z0-9]+/)
      .map(sanitizeAutocompleteToken)
      .filter((token) => token.length > 1)
      .forEach((token) => terms.add(token));
  }
  return Array.from(terms);
};

const normalizeBookmarkTimestamp = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 1000) / 1000;
};

const updateAutocomplete = async (terms, incrementBy = 1) => {
  try {
    const uniqueTerms = Array.from(
      new Set((terms || []).map(sanitizeAutocompleteToken).filter((term) => term.length > 1)),
    );

    if (uniqueTerms.length === 0) return;

    const now = new Date();
    await Autocomplete.bulkWrite(
      uniqueTerms.map((term) => ({
        updateOne: {
          filter: { term },
          update: {
            $setOnInsert: { term },
            $set: { createdAt: now },
            $inc: { frequency: incrementBy },
          },
          upsert: true,
        },
      })),
    );
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

    video.likes = Array.isArray(video.likes) ? video.likes : [];
    video.dislikes = Array.isArray(video.dislikes) ? video.dislikes : [];

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

// GET API: Get private bookmarks for the current user on a video
videoRouter.get("/:id/bookmarks", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const videoExists = await Video.exists({ _id: req.params.id });
    if (!videoExists) return res.status(404).json({ error: "Video not found" });

    const bookmarks = await Bookmark.find({
      user: userId,
      video: req.params.id,
    }).sort({ timestampSeconds: 1, createdAt: 1 });

    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST API: Save or update a private bookmark for a video timestamp
videoRouter.post("/:id/bookmarks", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const videoExists = await Video.exists({ _id: req.params.id });
    if (!videoExists) return res.status(404).json({ error: "Video not found" });

    const timestampSeconds = normalizeBookmarkTimestamp(req.body?.timestampSeconds);
    const note = String(req.body?.note || "").trim();

    if (timestampSeconds === null) {
      return res.status(400).json({ error: "A valid timestamp is required" });
    }

    if (!note) {
      return res.status(400).json({ error: "A note is required" });
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      {
        user: userId,
        video: req.params.id,
        timestampSeconds,
      },
      {
        $set: {
          user: userId,
          video: req.params.id,
          timestampSeconds,
          note,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    res.json(bookmark);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "That bookmark already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE API: Remove a private bookmark
videoRouter.delete("/:id/bookmarks/:bookmarkId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    if (!mongoose.Types.ObjectId.isValid(req.params.bookmarkId)) {
      return res.status(400).json({ error: "Invalid bookmark id" });
    }

    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.bookmarkId,
      user: userId,
      video: req.params.id,
    });

    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    res.json({ message: "Bookmark deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get videos uploaded by channels the current user is subscribed to
videoRouter.get("/subscriptions/feed", isAuthenticated, async (req, res) => {
  try {
    const currentUserId = req.session.userId?.toString();
    if (!currentUserId) return res.status(401).json({ error: "Not authenticated" });

    const sort = req.query.sort || "recent";
    const currentUser = await User.findById(currentUserId).select("subscriptions");
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const subscribedUserIds = Array.isArray(currentUser.subscriptions)
      ? currentUser.subscriptions
      : [];

    if (subscribedUserIds.length === 0) {
      return res.json([]);
    }

    let sortOption = { uploadedAt: -1 };
    if (sort === "trending" || sort === "views") sortOption = { views: -1 };

    const videos = await Video.find({ uploader: { $in: subscribedUserIds }, visibility: 0 })
      .sort(sortOption)
      .populate("uploader", "_id username publicName verified subscribers profilePicture");

    res.json(videos);
  } catch (err) {
    console.error("Subscriptions feed error:", err);
    res.status(500).json({ error: "Server error while retrieving subscriptions feed" });
  }
});

// API: Get all videos with optional sorting and filtering
videoRouter.get("/", async (req, res) => {
  try {
    const { sort, tag, uploader } = req.query;

    let sortOption = { uploadedAt: -1 };
    if (sort === "trending") sortOption = { views: -1 };

    const query = { visibility: 0 };
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
    const viewerId = req.session?.userId?.toString() || null;
    const video = await Video.findById(req.params.id).populate("uploader", "_id username publicName verified subscribers profilePicture");

    if (!video) return res.status(404).json({ error: "Video not found" });
    const isOwner = viewerId && video.uploader?._id?.toString() === viewerId;
    if (video.visibility === 2 && !isOwner) {
      return res.status(404).json({ error: "Video not found" });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("uploader", "_id username publicName verified subscribers profilePicture");

    // Add uploaderId to response for frontend
    const videoData = updatedVideo.toObject();
    videoData.uploaderId = updatedVideo.uploader?._id;

    if (updatedVideo.uploader?._id) {
      ChannelView.create({
        uploader: updatedVideo.uploader._id,
        video: updatedVideo._id,
        viewer: viewerId,
        viewedAt: new Date(),
      }).catch((err) => {
        console.error("Failed to record channel view:", err);
      });
    }

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

      const { title, description, tags, category } = req.body;
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
        category: sanitizeVideoCategory(category),
        filename: videoFile.filename,
        thumbnail: thumbnailFile?.filename || "",
        views: 0,
        tags: sanitizedTags,
        uploader: user,
        visibility: [0, 1, 2].includes(Number(req.body.visibility)) ? Number(req.body.visibility) : 0,
      });

      await video.save();

      const autocompleteTerms = extractAutocompleteTerms(video.title, video.description, video.tags);
      await updateAutocomplete(autocompleteTerms);

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
    const { sort } = req.query;
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Missing search query" });

    await updateAutocomplete(extractAutocompleteTerms(q));

    let query = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ],
      visibility: 0,
    };

    // TODO: Put under a debug flag
    const terms = await Autocomplete.find({
      term: { $regex: `.*`, $options: "i" }
    })
    .sort({ frequency: -1 })
    .limit(10);

    apiMessage("GET", "/search?q=" + q, "New search query added to autocomplete database! All search queries: ");
    terms.forEach(term => {
      apiMessage("GET", "/search?q=" + q, "Term: " + term.term);
      apiMessage("GET", "/search?q=" + q, "Frequency: " + term.frequency);
      apiMessage("GET", "/search?q=" + q, "Created At: " + term.createdAt);
    })

    let sortOption = {};
    if (sort === "date") sortOption = { uploadedAt: -1 };
    else if (sort === "views") sortOption = { views: -1 };
    else sortOption = { relevance: -1 }; // fallback (you can implement textScore if needed)

    const videos = await Video.find(query)
      .sort(sortOption)
      .populate("uploader", "_id username publicName verified profilePicture");

    // Seed from most popular matching content so autocomplete leans toward high-interest terms.
    const popularResults = [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);
    const popularTerms = extractAutocompleteTerms(
      popularResults.map((video) => video.title),
      popularResults.map((video) => video.tags || []),
    );
    await updateAutocomplete(popularTerms, 2);

    res.json(videos);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error during search: " + err.message });
  }
});

// GET API: Return search autocomplete information
videoRouter.get("/search/autocomplete", async (req, res) => {
  try {
    const q = sanitizeAutocompleteToken(req.query.q);

    if (!q) {
      return res.json([]);
    }

    const terms = await Autocomplete.find({
      term: { $regex: `^${q}`, $options: "i" }
    })
    .sort({ frequency: -1 })
    .limit(10); 

    // TODO: Only return terms if the frequency is greater than a popularity threshold e.g 5000
    res.json(terms.map((t) => sanitizeAutocompleteToken(t.term)).filter(Boolean));

  } catch (err) {
    res.status(500).json({error: "Error while retrieving autocomplete info: " + err.message})
  }
});

// GET API: Return all videos for a specific category
videoRouter.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category?.trim().toLowerCase();
    const sort = req.query.sort || "recent";

    if (!isVideoCategory(category)) {
      return res.status(404).json({ error: "Category not found" });
    }

    const query =
      category === DEFAULT_VIDEO_CATEGORY
        ? {
            $or: [
              { category },
              { category: { $exists: false } },
              { category: null },
            ],
          }
        : { category };

    let sortOption = { uploadedAt: -1 };
    if (sort === "trending") sortOption = { views: -1 };
    else if (sort === "views") sortOption = { views: -1 };

    const videos = await Video.find({ ...query, visibility: 0 })
      .sort(sortOption)
      .populate("uploader", "_id username publicName verified profilePicture");

    res.json(videos);
  } catch (err) {
    console.error("Category lookup error:", err);
    res.status(500).json({ error: "Server error while retrieving category videos: " + err.message });
  }
});

// GET API: Return details of a single video by ID
videoRouter.get("/:id", async (req, res) => {
  try {
    const currentUserId = req.session?.userId?.toString();
    const video = await Video.findById(req.params.id).populate("uploader", "_id username publicName verified profilePicture");
    if (!video) return res.status(404).json({ error: "Video not found" });
    const isOwner = currentUserId && video.uploader?._id?.toString() === currentUserId;
    if (video.visibility === 2 && !isOwner) {
      return res.status(404).json({ error: "Video not found" });
    }

    const videoData = video.toObject();
    videoData.uploaderId = video.uploader?._id;

    res.json(videoData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while retrieving video by id: " + err });
  }
});

export default videoRouter;
