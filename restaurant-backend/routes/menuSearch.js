const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");

// GET /api/menu/search
router.get("/search", async (req, res) => {
  try {
    const {
      name,
      category,
      tags,
      ingredients,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "price",
      order = "asc",
    } = req.query;

    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(",") };
    if (ingredients) filter.ingredients = { $in: ingredients.split(",") };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOption = {};
    sortOption[sortBy] = order === "asc" ? 1 : -1;

    const items = await MenuItem.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await MenuItem.countDocuments(filter);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Error in menu search:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
