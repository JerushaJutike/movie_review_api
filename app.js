const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const genreRoutes = require("./routes/genreRoutes");
const movieRoutes = require("./routes/movieRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Movie Review API"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || "Server error."
  });
});

module.exports = app;