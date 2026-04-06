import MongoStore from "connect-mongo";
import cors from "cors";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";

import commentsRouter from "./routes/commentsRoutes.js";
import userRouter from "./routes/userRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import helperRouter from "./routes/helperRoutes.js";
import playlistRouter from "./routes/playlistRoutes.js";
import { obtainLocalIPAddress } from "./utils/net.js";

const PORT = process.env.SERVER_PORT || 5000;
const EXPOSE_NETWORK = true;
// const EXPOSE_NETWORK = process.env.EXPOSE_NETWORK === "true";

const app = express();
const localIP = obtainLocalIPAddress();

// You must have MongoDB installed: https://www.mongodb.com/try/download/community
// Here we connect to a local MongoDB instance. I haven't tried out MongoDB Atlas yet.
mongoose.connect(
  process.env.MONGO_SERVER || "mongodb://127.0.0.1:27017/twaire",
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () =>
  console.log("Connected to MongoDB instance successfully"),
);

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
  }),
);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const localIpRegex = /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

//       if (!origin) return callback(null, true); // allow Postman or server-to-server

//       if (localIpRegex.test(origin)) {
//         return callback(null, true);
//       }

//       console.warn(`CORS blocked: ${origin}`);
//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true, // allow cookies
//   })
// );

// Uncomment this to allow any domain to access this server (not recommended)
app.use(
  cors({
    origin: true, // allow all origins
    credentials: true, // allow cookies
  }),
);

app.use(express.json());
app.use("/res", express.static("../resources"));
app.use("/data/uploads", express.static("data/uploads"));
app.use("/data/thumbnails", express.static("data/thumbnails"));
app.use("/data/banners", express.static("data/banners"));
app.use("/data/profile_pictures", express.static("data/profile_pictures"));
app.use("/data/playlist_thumbnails", express.static("data/playlist_thumbnails"));
app.use("/api/users", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/helper", helperRouter);
app.use("/api/playlists", playlistRouter);

/* If you want to port forward your server, run the server on 0.0.0.0 (set EXPOSE_NETWORK=true) */
app.listen(PORT, EXPOSE_NETWORK ? "0.0.0.0" : "127.0.0.1", () => {
  console.log("You are now running the Twaire backend server.");
  console.log("https://github.com/theonlyasdk/twaire");
  console.log(`Server running on: http://localhost:${PORT}`);

  if (EXPOSE_NETWORK)
    console.log(`Accessible on LAN: http://${localIP}:${PORT}`);
});
