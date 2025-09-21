import MongoStore from "connect-mongo";
import cors from "cors";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import os from "os";

import commentsRouter from "./routes/commentsRoutes.js";
import userRouter from "./routes/userRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import helperRouter from "./routes/helperRoutes.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

const networkInterfaces = os.networkInterfaces();
let localIP = "localhost";

for (const iface of Object.values(networkInterfaces)) {
  for (const i of iface) {
    if (i.family === "IPv4" && !i.internal) {
      localIP = i.address;
      break;
    }
  }
}

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

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman or server-to-server requests
      if (!origin) return callback(null, true);

      // Allowed origins: localhost, dev port, and your machine's LAN IP
      const allowedOrigins = [
        process.env.CLIENT_URL || `http://localhost:5173`,
        `http://${localIP}:5173`, // the LAN-accessible client URL
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/thumbnails", express.static("thumbnails"));
app.use("/profile_pictures", express.static("profile_pictures"));
app.use("/api/users", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/helper", helperRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log("You are now running the Twaire backend server. https://github.com/theonlyasdk/twaire");
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Accessible on LAN: http://${localIP}:${PORT}`);
});
