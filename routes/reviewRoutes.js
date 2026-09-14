const express = require("express");

const {
  addReview,
  getReviews,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getReviews);

// Logged-in users
router.post("/", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;