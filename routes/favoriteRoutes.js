const express = require("express");

const {
  addFavorite,
  getFavorites,
  removeFavorite
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Add favorite
router.post("/", protect, addFavorite);

// Get user's favorites
router.get("/", protect, getFavorites);

// Remove favorite
router.delete("/:movieId", protect, removeFavorite);

module.exports = router;