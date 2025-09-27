import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Za-z0-9_]+$/,
  },
  publicName: { type: String, default: null },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: true },
  official: { type: Boolean, default: false },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  accountViews: { type: Number, default: 0 },
  profilePicture: { type: String, default: null },
  bio: { type: String, default: null },
  createdAt: { type: Date, default: null },
});

userSchema.pre('save', function (next) {
  // Check if publicName is null/undefined AND username is set
  if ((this.publicName === null || this.publicName === undefined) && this.username) {
    this.publicName = this.username;
  }
  next();
});

export default userSchema;