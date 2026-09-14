const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required."],
      trim: true,
      minlength: [2, "Movie title must be at least 2 characters."]
    },

    description: {
      type: String,
      required: [true, "Movie description is required."],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters."]
    },

    releaseYear: {
      type: Number,
      required: [true, "Release year is required."],
      min: [1888, "Invalid release year."],
      max: [2100, "Invalid release year."]
    },

    duration: {
      type: Number,
      required: [true, "Duration is required."],
      min: [1, "Duration must be greater than 0."]
    },

    language: {
      type: String,
      required: [true, "Language is required."],
      trim: true
    },

    director: {
      type: String,
      required: [true, "Director is required."],
      trim: true
    },

    cast: {
      type: [String],
      required: [true, "Cast is required."]
    },

    genre: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
        required: true
      }
    ],

    poster: {
      type: String,
      trim: true
    },

    trailer: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Movie", movieSchema);