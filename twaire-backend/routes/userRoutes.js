import express from "express";
import bcrypt from "bcrypt";
import { User, Video } from "../models/models.js";
import isAuthenticated from "../middleware/auth.js";
import { userUpload } from "../providers/storage.js";

const userRouter = express.Router();

// POST API: User login
userRouter.post("/login", async (req, res) => {
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

// POST API: User signup
userRouter.post("/signup", async (req, res) => {
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

// POST API: User logout
userRouter.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Failed to logout" });
    res.clearCookie("connect.sid"); // default cookie name
    res.json({ message: "Logged out" });
  });
});

// GET API: get current logged in user (private, requires auth)
userRouter.get("/me", isAuthenticated, async (req, res) => {
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

// PUT API: update user profile (private, requires auth)
userRouter.put("/profile", isAuthenticated, userUpload.single("profilePicture"), async (req, res) => {
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

// GET API: get all videos from a user by user ID
userRouter.get("/:id/videos", async (req, res) => {
  try {
    const videos = await Video.find({ uploader: req.params.id }).sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Server error while retrieving videos from user" });
  }
});

// GET API: get user by username (public info only)
userRouter.get("/:username", async (req, res) => {
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

// POST API: increment account view count
userRouter.post("/:username/view", async (req, res) => {
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

// GET API: Check if current user is subscribed to another user
userRouter.get("/:id/isSubscribed", isAuthenticated, async (req, res) => {
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

// POST API: Subscribe / Unsubscribe to a user
userRouter.post("/:id/subscribe", isAuthenticated, async (req, res) => {
  try {
    // Optionally simulate delay
    // await delay(500);

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

export default userRouter;