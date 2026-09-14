const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");
const Movie = require("../models/Movie");

// Add Favorite
const addFavorite = async (req, res) => {
  try {
    const { movie } = req.body;

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie is required."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(movie)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID."
      });
    }

    const movieExists = await Movie.findById(movie);

    if (!movieExists) {
      return res.status(404).json({
        success: false,
        message: "Movie not found."
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      movie
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Movie is already in favorites."
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      movie
    });

    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate("user", "name email")
      .populate("movie", "title");

    res.status(201).json({
      success: true,
      message: "Movie added to favorites successfully.",
      data: populatedFavorite
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Movie is already in favorites."
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id
    })
      .populate("movie", "title description releaseYear duration language director cast poster trailer")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: favorites.length,
      data: favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove Favorite
const removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID."
      });
    }

    const favorite = await Favorite.findOne({
      user: req.user._id,
      movie: movieId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Movie is not in your favorites."
      });
    }

    await favorite.deleteOne();

    res.json({
      success: true,
      message: "Movie removed from favorites successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite
};