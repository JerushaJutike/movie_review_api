const mongoose = require("mongoose");
const Genre = require("../models/Genre");

// Create Genre
const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Genre name is required."
      });
    }

    const existingGenre = await Genre.findOne({
      name: name.trim()
    });

    if (existingGenre) {
      return res.status(409).json({
        success: false,
        message: "Genre already exists."
      });
    }

    const genre = await Genre.create({
      name: name.trim(),
      description: description ? description.trim() : ""
    });

    res.status(201).json({
      success: true,
      message: "Genre created successfully.",
      data: genre
    });
  } catch (error) {
    next(error);
  }
};

// Get All Genres
const getGenres = async (req, res, next) => {
  try {
    const {
      search = "",
      sortBy = "name",
      order = "asc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i"
      };
    }

    const allowedSortFields = ["name", "createdAt", "updatedAt"];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field."
      });
    }

    const sortOrder = order.toLowerCase() === "desc" ? -1 : 1;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const [genres, total] = await Promise.all([
      Genre.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNumber),

      Genre.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: "Genres retrieved successfully.",
      data: genres,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Genre By ID
const getGenreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid genre ID."
      });
    }

    const genre = await Genre.findById(id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Genre not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Genre retrieved successfully.",
      data: genre
    });
  } catch (error) {
    next(error);
  }
};

// Update Genre
const updateGenre = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid genre ID."
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Genre name cannot be empty."
      });
    }

    if (name !== undefined) {
      const duplicate = await Genre.findOne({
        name: name.trim(),
        _id: { $ne: id }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another genre with this name already exists."
        });
      }
    }

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    const genre = await Genre.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Genre not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Genre updated successfully.",
      data: genre
    });
  } catch (error) {
    next(error);
  }
};

// Delete Genre
const deleteGenre = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid genre ID."
      });
    }

    const genre = await Genre.findByIdAndDelete(id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Genre not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Genre deleted successfully.",
      data: genre
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGenre,
  getGenres,
  getGenreById,
  updateGenre,
  deleteGenre
};