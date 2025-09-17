
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
});

export default AutocompleteSchema;
