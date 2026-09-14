const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Genre name is required."],
      unique: true,
      trim: true,
      minlength: [2, "Genre name must be at least 2 characters."]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters."]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Genre", genreSchema);