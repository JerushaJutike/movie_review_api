const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const Genre = require("../models/Genre");

// Create Movie
const createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      releaseYear,
      duration,
      language,
      director,
      cast,
      genre,
      poster,
      trailer
    } = req.body;

    if (
      !title ||
      !description ||
      releaseYear === undefined ||
      duration === undefined ||
      !language ||
      !director ||
      !cast ||
      !genre
    ) {
      return res.status(400).json({
        success: false,
        message: "All required movie fields must be provided."
      });
    }

    if (!Array.isArray(cast) || cast.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cast must be a non-empty array."
      });
    }

    if (!Array.isArray(genre) || genre.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Genre must be a non-empty array."
      });
    }

    const invalidGenreId = genre.some(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidGenreId) {
      return res.status(400).json({
        success: false,
        message: "One or more genre IDs are invalid."
      });
    }

    const genresExist = await Genre.countDocuments({
      _id: { $in: genre }
    });

    if (genresExist !== genre.length) {
      return res.status(404).json({
        success: false,
        message: "One or more genres were not found."
      });
    }

    const movie = await Movie.create({
      title,
      description,
      releaseYear,
      duration,
      language,
      director,
      cast,
      genre,
      poster,
      trailer
    });

    const populatedMovie = await Movie.findById(movie._id).populate(
      "genre",
      "name description"
    );

    res.status(201).json({
      success: true,
      message: "Movie created successfully.",
      data: populatedMovie
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

// Get All Movies
const getMovies = async (req, res) => {
  try {
    const {
      search,
      genre,
      language,
      releaseYear,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { director: { $regex: search, $options: "i" } },
        { language: { $regex: search, $options: "i" } }
      ];
    }

    if (genre) {
      if (!mongoose.Types.ObjectId.isValid(genre)) {
        return res.status(400).json({
          success: false,
          message: "Invalid genre ID."
        });
      }

      filter.genre = genre;
    }

    if (language) {
      filter.language = {
        $regex: language,
        $options: "i"
      };
    }

    if (releaseYear) {
      const year = Number(releaseYear);

      if (!Number.isInteger(year)) {
        return res.status(400).json({
          success: false,
          message: "Release year must be a valid number."
        });
      }

      filter.releaseYear = year;
    }

    const allowedSortFields = [
      "title",
      "releaseYear",
      "duration",
      "createdAt"
    ];

    const selectedSortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOrder = order === "asc" ? 1 : -1;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [movies, totalMovies] = await Promise.all([
      Movie.find(filter)
        .populate("genre", "name description")
        .sort({ [selectedSortField]: sortOrder })
        .skip(skip)
        .limit(limitNumber),

      Movie.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: movies.length,
      total: totalMovies,
      page: pageNumber,
      pages: Math.ceil(totalMovies / limitNumber),
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Movie By ID
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID."
      });
    }

    const movie = await Movie.findById(id).populate(
      "genre",
      "name description"
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found."
      });
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Movie
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID."
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found."
      });
    }

    const allowedFields = [
      "title",
      "description",
      "releaseYear",
      "duration",
      "language",
      "director",
      "cast",
      "genre",
      "poster",
      "trailer"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        movie[field] = req.body[field];
      }
    });

    if (movie.genre) {
      if (!Array.isArray(movie.genre) || movie.genre.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Genre must be a non-empty array."
        });
      }

      const invalidGenreId = movie.genre.some(
        (genreId) => !mongoose.Types.ObjectId.isValid(genreId)
      );

      if (invalidGenreId) {
        return res.status(400).json({
          success: false,
          message: "One or more genre IDs are invalid."
        });
      }

      const genresExist = await Genre.countDocuments({
        _id: { $in: movie.genre }
      });

      if (genresExist !== movie.genre.length) {
        return res.status(404).json({
          success: false,
          message: "One or more genres were not found."
        });
      }
    }

    await movie.save();

    const updatedMovie = await Movie.findById(movie._id).populate(
      "genre",
      "name description"
    );

    res.json({
      success: true,
      message: "Movie updated successfully.",
      data: updatedMovie
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

// Delete Movie
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID."
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found."
      });
    }

    await movie.deleteOne();

    res.json({
      success: true,
      message: "Movie deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie
};