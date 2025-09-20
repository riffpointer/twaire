
import mongoose from "mongoose";

const AutocompleteSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  frequency: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: null
  }
});

export default AutocompleteSchema;
