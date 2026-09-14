const mongoose = require("mongoose");
const Review = require("../models/Review");
const Movie = require("../models/Movie");

// Add Review
const addReview = async (req, res) => {
  try {
    const { movie, rating, review } = req.body;

    if (!movie || rating === undefined || !review) {
      return res.status(400).json({
        success: false,
        message: "Movie, rating and review are required."
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

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5."
      });
    }

    const newReview = await Review.create({
      movie,
      user: req.user._id,
      rating: numericRating,
      review
    });

    const populatedReview = await Review.findById(newReview._id)
      .populate("user", "name email")
      .populate("movie", "title");

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: populatedReview
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", ")
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Reviews
const getReviews = async (req, res) => {
  try {
    const { movie, user, rating, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (movie) {
      if (!mongoose.Types.ObjectId.isValid(movie)) {
        return res.status(400).json({
          success: false,
          message: "Invalid movie ID."
        });
      }

      filter.movie = movie;
    }

    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID."
        });
      }

      filter.user = user;
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isFinite(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5."
        });
      }

      filter.rating = numericRating;
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [reviews, totalReviews] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email")
        .populate("movie", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Review.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: reviews.length,
      total: totalReviews,
      page: pageNumber,
      pages: Math.ceil(totalReviews / limitNumber),
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    if (rating === undefined && review === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide rating or review to update."
      });
    }

    const existingReview = await Review.findById(id);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    if (existingReview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review."
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isFinite(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5."
        });
      }

      existingReview.rating = numericRating;
    }

    if (review !== undefined) {
      if (typeof review !== "string" || review.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Review must be at least 2 characters."
        });
      }

      existingReview.review = review.trim();
    }

    await existingReview.save();

    const updatedReview = await Review.findById(existingReview._id)
      .populate("user", "name email")
      .populate("movie", "title");

    res.json({
      success: true,
      message: "Review updated successfully.",
      data: updatedReview
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", ")
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    const existingReview = await Review.findById(id);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    if (existingReview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review."
      });
    }

    await existingReview.deleteOne();

    res.json({
      success: true,
      message: "Review deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addReview,
  getReviews,
  updateReview,
  deleteReview
};