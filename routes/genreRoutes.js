const express = require("express");

const {
  createGenre,
  getGenres,
  getGenreById,
  updateGenre,
  deleteGenre
} = require("../controllers/genreController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getGenres);
router.get("/:id", getGenreById);

// Admin only
router.post("/", protect, adminOnly, createGenre);
router.put("/:id", protect, adminOnly, updateGenre);
router.delete("/:id", protect, adminOnly, deleteGenre);

module.exports = router;