/**
 * Multer storage configuration for handling file uploads.
 */
import multer from "multer";
import path from "path";
import fs from "fs";

// multer setup for profile picture uploads
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "data/profile_pictures";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// multer setup for banner uploads
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "data/banners";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Combined middleware for profile picture and banner
const userUpload = multer({ storage: userStorage });
const bannerUpload = multer({ storage: bannerStorage });
const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let dir;
      if (file.fieldname === "profilePicture") {
        dir = "data/profile_pictures";
      } else if (file.fieldname === "banner") {
        dir = "data/banners";
      } else {
        dir = "data/uploads";
      }
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

// multer setup for file uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = "data/uploads";
    if (file.fieldname === "thumbnail") 
      uploadDir = "data/thumbnails"; // lets use a seperate folder for thumbnails
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const videoUpload = multer({ storage: videoStorage });

// multer setup for playlist thumbnail uploads
const playlistThumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "data/playlist_thumbnails";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const playlistThumbnailUpload = multer({
  storage: playlistThumbnailStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

export { userUpload, videoUpload, bannerUpload, profileUpload, playlistThumbnailUpload };