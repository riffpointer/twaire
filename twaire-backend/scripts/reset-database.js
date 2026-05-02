import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import { Autocomplete, Bookmark, ChannelView, Comment, Playlist, Reply, User, Video } from "../src/models/models.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..", "..");
const DATA_DIR = path.join(ROOT_DIR, "data");

const MONGO_URL = process.env.MONGO_SERVER || "mongodb://127.0.0.1:27017/twaire";

async function resetCollections() {
  await Promise.all([
    Video.deleteMany({}),
    User.deleteMany({}),
    Comment.deleteMany({}),
    Reply.deleteMany({}),
    Autocomplete.deleteMany({}),
    Bookmark.deleteMany({}),
    ChannelView.deleteMany({}),
    Playlist.deleteMany({}),
  ]);
}

async function resetDataFolders() {
  await fs.rm(DATA_DIR, { recursive: true, force: true });
}

async function main() {
  await mongoose.connect(MONGO_URL);
  try {
    await resetCollections();
    await resetDataFolders();
    console.log("Database and local user data reset successfully.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
