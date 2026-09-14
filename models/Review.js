const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required."]
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."]
    },

    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot exceed 5."]
    },

    review: {
      type: String,
      required: [true, "Review is required."],
      trim: true,
      minlength: [2, "Review must be at least 2 characters."],
      maxlength: [2000, "Review cannot exceed 2000 characters."]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Review", reviewSchema);