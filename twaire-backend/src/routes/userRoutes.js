import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import { User, Video, Comment, Reply, Bookmark, ChannelView, Playlist } from "../models/models.js";
import isAuthenticated from "../middleware/auth.js";
import { profileUpload } from "../providers/storage.js";
import { apiMessage, apiError } from "../utils/logging.js";

const userRouter = express.Router();
const MAX_ACCOUNT_SWITCH_TOKENS = 10;

function hashSwitchToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildUserPayload(user) {
  return {
    _id: user._id,
    username: user.username,
    publicName: user.publicName || user.username,
    verified: user.verified,
    subscribers: user.subscribers.length,
    accountViews: user.accountViews,
    profilePicture: user.profilePicture,
    banner: user.banner,
    bio: user.bio,
    trailerVideo: user.trailerVideo,
    links: Array.isArray(user.links) ? user.links : [],
    createdAt: user.createdAt,
  };
}

function parseProfileLinks(rawLinks) {
  if (!rawLinks) return [];

  let parsedLinks = [];
  try {
    parsedLinks = JSON.parse(rawLinks);
  } catch {
    throw new Error("Invalid links format");
  }

  if (!Array.isArray(parsedLinks)) {
    throw new Error("Invalid links format");
  }

  return parsedLinks
    .map((entry) => ({
      title: String(entry?.title || "").trim(),
      url: String(entry?.url || "").trim(),
    }))
    .filter((entry) => entry.title && entry.url)
    .slice(0, 12);
}

async function issueAccountSwitchToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSwitchToken(token);

  user.accountSwitchTokens = [
    ...(user.accountSwitchTokens || []),
    {
      tokenHash,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    },
  ].slice(-MAX_ACCOUNT_SWITCH_TOKENS);

  await user.save();
  return token;
}

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    apiError("POST", "/login", "All fields required");
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      apiError("POST", "/login", "User not found");
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      apiError("POST", "/login", "Wrong password entered");
      return res.status(400).json({ error: "Wrong password entered" });
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    const switchToken = await issueAccountSwitchToken(user);

    apiMessage("POST", "/login", `User ${user.username} logged in`);
    res.json({
      message: "Login successful",
      user: buildUserPayload(user),
      switchToken,
    });
  } catch (err) {
    apiError("POST", "/login", "Login failed:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

userRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      apiError("POST", "/signup", "All fields are required");
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      apiError("POST", "/signup", "Invalid username format");
      return res.status(400).json({ error: "Invalid username format" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      apiError("POST", "/signup", "Username or email already exists");
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      createdAt: Date.now()
    });

    await newUser.save();

    const watchLater = new Playlist({
      name: "Watch Later",
      owner: newUser._id,
      visibility: 2,
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    await watchLater.save();
    apiMessage("POST", "/signup", `New user created: ${username}`);
    res.json({ message: "Signup successful", userId: newUser._id });
  } catch (err) {
    apiError("POST", "/signup", "Signup failed:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

userRouter.post("/logout", async (req, res) => {
  try {
    if (req.session?.userId && req.body?.switchToken) {
      const user = await User.findById(req.session.userId);
      if (user) {
        const tokenHash = hashSwitchToken(req.body.switchToken);
        user.accountSwitchTokens = (user.accountSwitchTokens || []).filter(
          (tokenEntry) => tokenEntry.tokenHash !== tokenHash,
        );
        await user.save();
      }
    }
  } catch (err) {
    apiError("POST", "/logout", "Failed to revoke account switch token:", err);
  }

  req.session.destroy(err => {
    if (err) {
      apiError("POST", "/logout", "Failed to logout:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    apiMessage("POST", "/logout", `User logged out`);
    res.json({ message: "Logged out" });
  });
});

userRouter.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      apiError("GET", "/me", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    res.json(buildUserPayload(user));
  } catch (err) {
    apiError("GET", "/me", "Failed to fetch user:", err);
    res.status(500).json({ error: "Server error fetching user profile" });
  }
});

userRouter.get("/me/bookmarks", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const bookmarks = await Bookmark.find({ user: userId })
      .populate("video", "_id title")
      .sort({ updatedAt: -1, timestampSeconds: 1 });

    const groupsMap = new Map();

    for (const bookmark of bookmarks) {
      if (!bookmark.video?._id) continue;
      const videoId = bookmark.video._id.toString();
      if (!groupsMap.has(videoId)) {
        groupsMap.set(videoId, {
          video: {
            _id: bookmark.video._id,
            title: bookmark.video.title,
          },
          latestBookmarkAt: bookmark.updatedAt || bookmark.createdAt,
          bookmarks: [],
        });
      }

      const group = groupsMap.get(videoId);
      group.bookmarks.push({
        _id: bookmark._id,
        timestampSeconds: bookmark.timestampSeconds,
        note: bookmark.note,
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt,
      });

      if ((bookmark.updatedAt || bookmark.createdAt) > group.latestBookmarkAt) {
        group.latestBookmarkAt = bookmark.updatedAt || bookmark.createdAt;
      }
    }

    const groupedBookmarks = Array.from(groupsMap.values())
      .map((group) => ({
        ...group,
        bookmarks: group.bookmarks.sort((left, right) => left.timestampSeconds - right.timestampSeconds),
      }))
      .sort((left, right) => new Date(right.latestBookmarkAt) - new Date(left.latestBookmarkAt));

    res.json(groupedBookmarks);
  } catch (err) {
    apiError("GET", "/me/bookmarks", "Failed to fetch bookmarks:", err);
    res.status(500).json({ error: "Server error while retrieving bookmarks" });
  }
});

userRouter.get("/me/analytics/views", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const requestedDays = Number.parseInt(req.query.days, 10);
    const days = Number.isFinite(requestedDays) && requestedDays > 0
      ? Math.min(requestedDays, 365)
      : 30;

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const series = Array.from({ length: days }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        date: date.toISOString().slice(0, 10),
        views: 0,
      };
    });

    const pipeline = [
      {
        $match: {
          uploader: new mongoose.Types.ObjectId(userId),
          viewedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$viewedAt",
              timezone: "UTC",
            },
          },
          views: { $sum: 1 },
        },
      },
    ];

    const dailyViews = await ChannelView.aggregate(pipeline);
    const bucketMap = new Map(series.map((entry) => [entry.date, entry]));
    for (const entry of dailyViews) {
      const bucket = bucketMap.get(entry._id);
      if (bucket) bucket.views = entry.views;
    }

    const totalViews = series.reduce((sum, entry) => sum + entry.views, 0);
    const averageViews = Math.round(totalViews / series.length);
    const last7Days = series.slice(-7);
    const previous7Days = series.slice(-14, -7);
    const last7Total = last7Days.reduce((sum, entry) => sum + entry.views, 0);
    const previous7Total = previous7Days.reduce((sum, entry) => sum + entry.views, 0);
    const bestDay = series.reduce((best, entry) => (entry.views > best.views ? entry : best), series[0] || { date: null, views: 0 });
    const activeDays = series.filter((entry) => entry.views > 0).length;
    const zeroDays = days - activeDays;
    const growthRate = previous7Total > 0
      ? Math.round(((last7Total - previous7Total) / previous7Total) * 100)
      : last7Total > 0
        ? 100
        : 0;

    res.json({
      days,
      start: start.toISOString(),
      end: end.toISOString(),
      totalViews,
      averageViews,
      activeDays,
      zeroDays,
      last7Total,
      previous7Total,
      growthRate,
      bestDay,
      series,
    });
  } catch (err) {
    apiError("GET", "/me/analytics/views", "Failed to fetch video analytics:", err);
    res.status(500).json({ error: "Server error while retrieving video analytics" });
  }
});

userRouter.get("/me/analytics/summary", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [user, videoSummary, topVideos, recentVideos, commentSummary, recentViewTotals] = await Promise.all([
      User.findById(userId).select("_id createdAt subscribers accountViews username publicName"),
      Video.aggregate([
        { $match: { uploader: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalViews: { $sum: "$views" },
            totalLikes: { $sum: { $size: "$likes" } },
            avgViews: { $avg: "$views" },
            avgDuration: { $avg: "$duration" },
          },
        },
      ]),
      Video.find({ uploader: userId })
        .sort({ views: -1, uploadedAt: -1 })
        .limit(5)
        .select("_id title thumbnail views likes uploadedAt duration category visibility"),
      Video.find({ uploader: userId })
        .sort({ uploadedAt: -1 })
        .limit(5)
        .select("_id title thumbnail views uploadedAt duration category visibility"),
      Comment.aggregate([
        {
          $match: {
            video: {
              $in: await Video.find({ uploader: userId }).distinct("_id"),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            totalCommentLikes: { $sum: { $size: "$likes" } },
            totalReplies: { $sum: { $size: "$replies" } },
          },
        },
      ]),
      ChannelView.aggregate([
        {
          $match: {
            uploader: new mongoose.Types.ObjectId(userId),
            viewedAt: {
              $gte: new Date(Date.now() - 30 * 86400000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$viewedAt",
                timezone: "UTC",
              },
            },
            views: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const summary = videoSummary[0] || {};
    const engagement = commentSummary[0] || {};
    const totalSubscribers = Array.isArray(user?.subscribers) ? user.subscribers.length : 0;
    const totalVideos = summary.totalVideos || 0;
    const totalViews = summary.totalViews || 0;
    const totalLikes = summary.totalLikes || 0;
    const totalComments = engagement.totalComments || 0;
    const avgViews = Math.round(summary.avgViews || 0);
    const avgDuration = Math.round(summary.avgDuration || 0);
    const viewsPerVideo = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
    const engagementRate = totalViews > 0 ? Math.round(((totalLikes + totalComments) / totalViews) * 1000) / 10 : 0;
    const viewsPerSubscriber = totalSubscribers > 0 ? Math.round(totalViews / totalSubscribers) : 0;
    const last30TotalViews = recentViewTotals.reduce((sum, entry) => sum + entry.views, 0);

    res.json({
      totals: {
        videos: totalVideos,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        commentLikes: engagement.totalCommentLikes || 0,
        replies: engagement.totalReplies || 0,
        subscribers: totalSubscribers,
        accountViews: user?.accountViews || 0,
        viewsPerSubscriber,
      },
      averages: {
        viewsPerVideo: viewsPerVideo || avgViews,
        durationSeconds: avgDuration,
        engagementRate,
      },
      trends: {
        last30TotalViews,
      },
      topVideos: topVideos.map((video) => ({
        _id: video._id,
        title: video.title,
        thumbnail: video.thumbnail,
        views: video.views || 0,
        likes: video.likes?.length || 0,
        uploadedAt: video.uploadedAt,
        duration: video.duration,
        category: video.category,
        visibility: video.visibility,
      })),
      recentVideos: recentVideos.map((video) => ({
        _id: video._id,
        title: video.title,
        thumbnail: video.thumbnail,
        views: video.views || 0,
        uploadedAt: video.uploadedAt,
        duration: video.duration,
        category: video.category,
        visibility: video.visibility,
      })),
      accountAgeDays: user?.createdAt
        ? Math.max(1, Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
        : null,
      videoSpan: {
        recent30Days: recentViewTotals,
      },
    });
  } catch (err) {
    apiError("GET", "/me/analytics/summary", "Failed to fetch dashboard summary:", err);
    res.status(500).json({ error: "Server error while retrieving dashboard summary" });
  }
});

userRouter.get("/check-username", async (req, res) => {
  try {
    const username = String(req.query.username || "").trim();

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: "Invalid username format", available: false });
    }

    const existingUser = await User.findOne({ username }).select("_id");
    res.json({ available: !existingUser });
  } catch (err) {
    apiError("GET", "/check-username", "Failed to check username:", err);
    res.status(500).json({ error: "Server error while checking username" });
  }
});

userRouter.get("/:id/subscriptions", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("subscriptions", "username publicName verified profilePicture subscribers")
      .select("subscriptions");

    if (!user) {
      apiError("GET", `/${req.params.id}/subscriptions`, "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const subscriptions = (user.subscriptions || []).map((subscriptionUser) => ({
      _id: subscriptionUser._id,
      username: subscriptionUser.username,
      publicName: subscriptionUser.publicName || subscriptionUser.username,
      verified: subscriptionUser.verified,
      profilePicture: subscriptionUser.profilePicture,
      subscribers: Array.isArray(subscriptionUser.subscribers)
        ? subscriptionUser.subscribers.length
        : 0,
    }));

    apiMessage("GET", `/${req.params.id}/subscriptions`, `Fetched subscriptions for user ${req.params.id}`);
    res.json(subscriptions);
  } catch (err) {
    apiError("GET", `/${req.params.id}/subscriptions`, "Failed to fetch subscriptions:", err);
    res.status(500).json({ error: "Server error while retrieving subscriptions" });
  }
});

userRouter.post("/me/account-switch-token", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      apiError("POST", "/me/account-switch-token", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const switchToken = await issueAccountSwitchToken(user);
    res.json({
      user: buildUserPayload(user),
      switchToken,
    });
  } catch (err) {
    apiError("POST", "/me/account-switch-token", "Failed to create account switch token:", err);
    res.status(500).json({ error: "Failed to create account switch token" });
  }
});

userRouter.post("/switch-account", async (req, res) => {
  const { userId, switchToken } = req.body || {};

  if (!userId || !switchToken) {
    return res.status(400).json({ error: "userId and switchToken are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tokenHash = hashSwitchToken(switchToken);
    const matchingToken = (user.accountSwitchTokens || []).find(
      (tokenEntry) => tokenEntry.tokenHash === tokenHash,
    );

    if (!matchingToken) {
      return res.status(401).json({ error: "Saved login has expired. Please log in again." });
    }

    matchingToken.lastUsedAt = new Date();
    await user.save();

    req.session.userId = user._id;
    req.session.username = user.username;

    apiMessage("POST", "/switch-account", `Switched session to user ${user.username}`);
    res.json({
      message: "Switched account successfully",
      user: buildUserPayload(user),
    });
  } catch (err) {
    apiError("POST", "/switch-account", "Failed to switch account:", err);
    res.status(500).json({ error: "Server error while switching account" });
  }
});

userRouter.delete("/me/delete/profile_picture", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      apiError("DELETE", "/me/delete/profile_picture", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    user.profilePicture = null;
    await user.save();

    apiMessage("DELETE", "/me/delete/profile_picture", "Profile picture removed");
    res.json({ message: "Profile picture removed successfully" });
  } catch (err) {
    apiError("DELETE", "/me/delete/profile_picture", "Failed to remove profile picture:", err);
    res.status(500).json({ error: "Server error while removing profile picture" });
  }
});

userRouter.delete("/me/delete/banner", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      apiError("DELETE", "/me/delete/banner", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    user.banner = null;
    await user.save();

    apiMessage("DELETE", "/me/delete/banner", "Banner removed");
    res.json({ message: "Banner removed successfully" });
  } catch (err) {
    apiError("DELETE", "/me/delete/banner", "Failed to remove banner:", err);
    res.status(500).json({ error: "Server error while removing banner" });
  }
});

userRouter.put("/profile", isAuthenticated, profileUpload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]), async (req, res) => {
  try {
    const { publicName, bio, links } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) {
      apiError("PUT", "/profile", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    user.publicName = publicName || user.publicName;
    user.bio = bio || user.bio;
    if (links !== undefined) {
      user.links = parseProfileLinks(links);
    }
    if (req.body.trailerVideo !== undefined) {
      user.trailerVideo = req.body.trailerVideo || null;
    }

    if (req.files) {
      if (req.files.profilePicture) {
        user.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.banner) {
        user.banner = req.files.banner[0].path;
      }
    }

    await user.save();
    apiMessage("PUT", "/profile", `Updated profile for user ${user.username}`);
    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        publicName: user.publicName,
        profilePicture: user.profilePicture,
        banner: user.banner,
        bio: user.bio,
        trailerVideo: user.trailerVideo,
        links: Array.isArray(user.links) ? user.links : [],
      },
    });
  } catch (err) {
    apiError("PUT", "/profile", "Profile update failed:", err);
    if (err.message === "Invalid links format") {
      return res.status(400).json({ error: "Invalid links format" });
    }
    res.status(500).json({ error: "Server error during profile update" });
  }
});

userRouter.get("/:id/videos", async (req, res) => {
  try {
    const currentUserId = req.session?.userId?.toString();
    const requestedVisibility = String(req.query.visibility || "").trim();
    const visibilityMap = { public: 0, unlisted: 1, private: 2 };
    const visibility = requestedVisibility in visibilityMap ? visibilityMap[requestedVisibility] : null;
    const isOwner = currentUserId && currentUserId === req.params.id;

    const query = { uploader: req.params.id };
    if (visibility !== null) {
      query.visibility = visibility;
    } else if (!isOwner) {
      query.visibility = 0;
    }

    const videos = await Video.find(query).sort({ uploadedAt: -1 });
    apiMessage("GET", `/${req.params.id}/videos`, `Fetched videos for user ${req.params.id}`);
    res.json(videos);
  } catch (err) {
    apiError("GET", `/${req.params.id}/videos`, "Failed to fetch videos:", err);
    res.status(500).json({ error: "Server error while retrieving videos" });
  }
});

userRouter.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate("trailerVideo");
    if (!user) {
      apiError("GET", `/${username}`, "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    apiMessage("GET", `/${username}`, `Fetched public profile for ${username}`);
    res.json({
      _id: user._id,
      username: user.username,
      publicName: user.publicName || user.username,
      verified: user.verified,
      subscribers: user.subscribers.length,
      accountViews: user.accountViews,
      profilePicture: user.profilePicture,
      banner: user.banner,
      bio: user.bio,
      trailerVideo: user.trailerVideo,
      links: Array.isArray(user.links) ? user.links : [],
      createdAt: user.createdAt,
    });
  } catch (err) {
    apiError("GET", `/${req.params.username}`, "Failed to fetch user:", err);
    res.status(500).json({ error: "Server error fetching user data" });
  }
});

userRouter.post("/:username/view", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOneAndUpdate({ username }, { $inc: { accountViews: 1 } }, { new: true });
    if (!user) {
      apiError("POST", `/${username}/view`, "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    apiMessage("POST", `/${username}/view`, `Incremented view count for ${username}`);
    res.json({
      username: user.username,
      publicName: user.publicName || user.username,
      verified: user.verified,
      subscribers: user.subscribers,
      accountViews: user.accountViews,
    });
  } catch (err) {
    apiError("POST", `/${req.params.username}/view`, "Failed to increment views:", err);
    res.status(500).json({ error: "Server error incrementing account views" });
  }
});

userRouter.get("/:id/isSubscribed", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      apiError("GET", `/${req.params.id}/isSubscribed`, "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const subscribed = (targetUser.subscribers || []).some(id => id.toString() === req.session.userId.toString());
    apiMessage("GET", `/${req.params.id}/isSubscribed`, `Checked subscription status for user ${req.session.userId}`);
    res.json({ subscribed });
  } catch (err) {
    apiError("GET", `/${req.params.id}/isSubscribed`, "Failed to check subscription:", err);
    res.status(500).json({ error: "Server error while retrieving subscription status" });
  }
});

userRouter.post("/:id/subscribe", isAuthenticated, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.session.userId;

    if (currentUserId === targetUserId) {
      apiError("POST", `/${targetUserId}/subscribe`, "Cannot subscribe to self");
      return res.status(400).json({ error: "You may not subscribe to yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    if (!currentUser || !targetUser) {
      apiError("POST", `/${targetUserId}/subscribe`, "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    currentUser.subscriptions = currentUser.subscriptions || [];
    targetUser.subscribers = targetUser.subscribers || [];

    const isSubscribed = currentUser.subscriptions.some(id => id.toString() === targetUserId.toString());
    if (isSubscribed) {
      currentUser.subscriptions = currentUser.subscriptions.filter(id => id.toString() !== targetUserId.toString());
      targetUser.subscribers = targetUser.subscribers.filter(id => id.toString() !== currentUserId.toString());
    } else {
      currentUser.subscriptions.push(targetUser._id);
      targetUser.subscribers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    apiMessage("POST", `/${targetUserId}/subscribe`, `Subscription status updated for user ${currentUserId}`);
    res.json({ subscribed: !isSubscribed });
  } catch (err) {
    apiError("POST", `/${req.params.id}/subscribe`, "Failed to update subscription:", err);
    res.status(500).json({ error: "Server error while updating subscription status" });
  }
});

userRouter.delete("/me", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (!user) {
      apiError("DELETE", "/me", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    await Video.deleteMany({ uploader: userId });
    await Comment.deleteMany({ author: userId });
    await Reply.deleteMany({ author: userId });
    await Bookmark.deleteMany({ user: userId });
    await User.updateMany({ subscribers: userId }, { $pull: { subscribers: userId } });
    await User.updateMany({ subscriptions: userId }, { $pull: { subscriptions: userId } });
    await User.findByIdAndDelete(userId);

    req.session.destroy(err => {
      if (err) {
        apiError("DELETE", "/me", "Failed to logout after account deletion:", err);
        return res.status(500).json({ error: "Failed to logout after account deletion" });
      }
      res.clearCookie("connect.sid");
      apiMessage("DELETE", "/me", `Account ${user.username} deleted`);
      res.json({ message: "Account deleted successfully" });
    });
  } catch (err) {
    apiError("DELETE", "/me", "Account deletion failed:", err);
    res.status(500).json({ error: "Server error during account deletion" });
  }
});

export default userRouter;
