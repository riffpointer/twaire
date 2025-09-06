import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";
import MongoStore from "connect-mongo";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
const PORT = 5000;

// You must have MongoDB installed: https://www.mongodb.com/try/download/community
// Let us connect to a local MongoDB instance.
mongoose.connect("mongodb://127.0.0.1:27017/twaire");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB instance successfully"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "session_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/twaire" }),
    cookie: {
      // Let us store the cookie for a maximum of 1 week
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
  })
);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/thumbnails", express.static("thumbnails"));
app.use("/profile_pictures", express.static("profile_pictures"));

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
  },
  { timestamps: true }
);

// schema for videos
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  filename: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  channel: { type: String, default: "Deleted User" },
  username: { type: String, default: "ghostuser" },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  uploadedAt: { type: Date, default: Date.now },
  tags: { type: [String], default: [] },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verified: { type: Boolean, default: false }
});

const Video = mongoose.model("Video", videoSchema);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Za-z0-9_]+$/,
  },
  publicName: { type: String, default: null },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  official: { type: Boolean, default: false },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  accountViews: { type: Number, default: 0 },
  profilePicture: { type: String, default: "" },
  bio: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Reply = mongoose.model("Reply", replySchema);

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "profile_pictures";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const userUpload = multer({ storage: userStorage });

app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "All fields required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password entered" });

  // Save user info in session
  req.session.userId = user._id;
  req.session.username = user.username;

  res.json({
    message: "Login successful",
    user: {
      username: user.username,
      publicName: user.publicName || user.username,
      profilePicture: user.profilePicture,
    },
  });
});

app.post("/api/users/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    // check username format
    if (!/^[A-Za-z0-9_]+$/.test(username))
      return res.status(400).json({ error: "Invalid username format" });

    // check uniqueness
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ error: "Username or email already exists" });

    // hash password (use bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.json({ message: "Signup successful", userId: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

app.post("/api/users/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Failed to logout" });
    res.clearCookie("connect.sid"); // default cookie name
    res.json({ message: "Logged out" });
  });
});

function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ error: "Not authenticated" });
}

// Example usage for protected route
app.get("/api/users/me", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    _id: user._id,
    username: user.username,
    publicName: user.publicName || user.username,
    profilePicture: user.profilePicture,
    bio: user.bio,
    subscribers: user.subscribers,
    verified: user.verified,
  });
});

app.put("/api/user/profile", isAuthenticated, userUpload.single("profilePicture"), async (req, res) => {
  try {
    const { publicName, bio } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.publicName = publicName || user.publicName;
    user.bio = bio || user.bio;

    if (req.file) {
      user.profilePicture = req.file.path;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        publicName: user.publicName,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Server error during profile update" });
  }
});

app.get("/api/users/:id/videos", async (req, res) => {
  try {
    const videos = await Video.find({ uploader: req.params.id }).sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Server error while retrieving videos from user" });
  }
});

// API: get user by username (public info only)
app.get("/api/users/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Only return public info
    res.json({
      _id: user._id,
      username: user.username,
      publicName: user.publicName || user.username,
      verified: user.verified,
      subscribers: user.subscribers.length,
      accountViews: user.accountViews,
      profilePicture: user.profilePicture,
      bio: user.bio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching user data" });
  }
});

// API: increment account view count
app.post("/api/users/:username/view", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { accountViews: 1 } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      username: user.username,
      publicName: user.publicName || user.username,
      verified: user.verified,
      subscribers: user.subscribers,
      accountViews: user.accountViews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error incrementing account views" });
  }
});

// multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = "uploads";
    if (file.fieldname === "thumbnail") uploadDir = "thumbnails"; // separate dir for thumbnails
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

app.post('/api/videos/:id/like', async (req, res) => {
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

// Dislike a video
app.post('/api/videos/:id/dislike', async (req, res) => {
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

// Get like/dislike counts
app.get('/api/videos/:id/reactions', async (req, res) => {
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

const upload = multer({ storage });

// API: get all videos with sorting
app.get("/api/videos", async (req, res) => {
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

    const videos = await Video.find(query).sort(sortOption);
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while retrieving videos" });
  }
});

// API: Increment view and get video details
// Increment view and get video details
app.post("/api/videos/:id/view", async (req, res) => {
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

app.get("/api/videos/:id/comments", async (req, res) => {
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

// Add new comment
app.post("/api/videos/:id/comments", async (req, res) => {
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

// Add reply to a comment
app.post("/api/comments/:id/replies", async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.replies.push({
      user: req.session.userId,
      text: req.body.text,
    });

    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while trying to retrieve replies" });
  }
});

// Like / Dislike toggle for comments
app.post("/api/comments/:id/like", async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const userId = req.session.userId;

    // remove dislike if exists
    comment.dislikes = comment.dislikes.filter(
      (id) => id.toString() !== userId
    );

    // toggle like
    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while trying to process reactions (like)" });
  }
});

app.post("/api/comments/:id/dislike", async (req, res) => {
  try {
    if (!req.session.userId)
      return res.status(401).json({ error: "Not logged in" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const userId = req.session.userId;

    // remove like if exists
    comment.likes = comment.likes.filter((id) => id.toString() !== userId);

    // toggle dislike
    if (comment.dislikes.includes(userId)) {
      comment.dislikes = comment.dislikes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      comment.dislikes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while trying to process reactions (dislike)" });
  }
});

// API: upload new video (with optional thumbnail)
app.post(
  "/api/videos",
  upload.fields([
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
        channel: user.publicName?.trim() || user.username,
        username: user.username,
        views: 0,
        tags: JSON.parse(sanitizedTags.toString().trim() || "[]"),
        uploader: userId,
      });

      await video.save();

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


app.get("/api/users/:id/isSubscribed", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // ensure array exists
    const subscribers = targetUser.subscribers || [];
    const subscribed = subscribers.some(id => id.toString() === req.session.userId.toString());

    res.json({ subscribed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while retrieving subscription status" });
  }
});

// POST /api/users/:id/subscribe
app.post("/api/users/:id/subscribe", isAuthenticated, async (req, res) => {
  try {
    await delay(500);

    const targetUserId = req.params.id;
    const currentUserId = req.session.userId;

    if (currentUserId === targetUserId)
      return res.status(400).json({ error: "You may not subscribe to yourself" });

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    if (!currentUser || !targetUser) return res.status(404).json({ error: "User not found" });

    // ensure arrays exist
    currentUser.subscriptions = currentUser.subscriptions || [];
    targetUser.subscribers = targetUser.subscribers || [];

    const isSubscribed = currentUser.subscriptions.some(
      id => id.toString() === targetUserId.toString()
    );

    if (isSubscribed) {
      currentUser.subscriptions = currentUser.subscriptions.filter(
        id => id.toString() !== targetUserId.toString()
      );
      targetUser.subscribers = targetUser.subscribers.filter(
        id => id.toString() !== currentUserId.toString()
      );
    } else {
      currentUser.subscriptions.push(targetUser._id);
      targetUser.subscribers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ subscribed: !isSubscribed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while updating subscription status" });
  }
});


// Search videos by title or description
app.get("/api/videos/search", async (req, res) => {
  try {
    const { q, sort } = req.query;
    if (!q) return res.status(400).json({ error: "Missing search query" });

    let query = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ]
    };

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

// API: get single video
app.get("/api/videos/:id", async (req, res) => {
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

app.listen(PORT, () =>
  console.log(`Twaire backend server is running at http://localhost:${PORT}`)
);
