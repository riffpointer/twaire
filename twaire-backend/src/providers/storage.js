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

const userUpload = multer({ storage: userStorage });

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

export { userUpload, videoUpload };