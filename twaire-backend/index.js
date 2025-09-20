import MongoStore from "connect-mongo";
import cors from "cors";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";

import commentsRouter from "./routes/commentsRoutes.js";
import userRouter from "./routes/userRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import helperRouter from "./routes/helperRoutes.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// You must have MongoDB installed: https://www.mongodb.com/try/download/community
// Let us connect to a local MongoDB instance.
mongoose.connect(process.env.MONGO_SERVER || "mongodb://127.0.0.1:27017/twaire");

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
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/thumbnails", express.static("thumbnails"));
app.use("/profile_pictures", express.static("profile_pictures"));
app.use("/api/users", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/helper", helperRouter);

app.listen(PORT, () => {
  console.log("You are now running the Twaire backend server. https://github.com/theonlyasdk/twaire");
  console.log(`Twaire backend server is running at http://localhost:${PORT}`)
});
