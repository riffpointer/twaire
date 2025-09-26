import express from "express";
import bcrypt from "bcrypt";
import { User, Video, Comment, Reply } from "../models/models.js";
import isAuthenticated from "../middleware/auth.js";
import { userUpload } from "../providers/storage.js";
import { apiMessage, apiError } from "../utils/logging.js";

const userRouter = express.Router();

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

    apiMessage("POST", "/login", `User ${user.username} logged in`);
    res.json({
      message: "Login successful",
      user: {
        username: user.username,
        publicName: user.publicName || user.username,
        profilePicture: user.profilePicture,
      },
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
    apiMessage("POST", "/signup", `New user created: ${username}`);
    res.json({ message: "Signup successful", userId: newUser._id });
  } catch (err) {
    apiError("POST", "/signup", "Signup failed:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

userRouter.post("/logout", (req, res) => {
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

    res.json({
      _id: user._id,
      username: user.username,
      publicName: user.publicName || user.username,
      verified: user.verified,
      subscribers: user.subscribers.length,
      accountViews: user.accountViews,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (err) {
    apiError("GET", "/me", "Failed to fetch user:", err);
    res.status(500).json({ error: "Server error fetching user profile" });
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

userRouter.put("/profile", isAuthenticated, userUpload.single("profilePicture"), async (req, res) => {
  try {
    const { publicName, bio } = req.body;
    const user = await User.findById(req.session.userId);
    if (!user) {
      apiError("PUT", "/profile", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    user.publicName = publicName || user.publicName;
    user.bio = bio || user.bio;
    if (req.file) user.profilePicture = req.file.path;

    await user.save();
    apiMessage("PUT", "/profile", `Updated profile for user ${user.username}`);
    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        publicName: user.publicName,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (err) {
    apiError("PUT", "/profile", "Profile update failed:", err);
    res.status(500).json({ error: "Server error during profile update" });
  }
});

userRouter.get("/:id/videos", async (req, res) => {
  try {
    const videos = await Video.find({ uploader: req.params.id }).sort({ uploadedAt: -1 });
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
    const user = await User.findOne({ username });
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
      bio: user.bio,
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
