/**
 * Multer storage configuration for handling file uploads.
 */
import multer from "multer";
import path from "path";
import fs from "fs";

// multer setup for profile picture uploads
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

// multer setup for file uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = "uploads";
    if (file.fieldname === "thumbnail") 
      uploadDir = "thumbnails"; // lets use a seperate folder for thumbnails
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const videoUpload = multer({ storage: videoStorage });

export { userUpload, videoUpload };