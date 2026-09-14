const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."]
    },

    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required."]
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);