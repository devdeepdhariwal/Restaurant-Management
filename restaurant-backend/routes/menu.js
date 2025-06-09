const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { deleteMenuItem } = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// ➕ Add new menu item (Admins only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.status(201).json({ message: "Menu item added successfully", item: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Get all menu items (Public/All Staff)
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({});
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Search menu items (Public/All Staff)
router.get("/search", async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      ingredients,
      sortBy = "price",
      order = "asc",
    } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (ingredients) {
      const ingredientArray = ingredients.split(",");
      filter.ingredients = { $all: ingredientArray };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const items = await MenuItem.find(filter).sort({ [sortBy]: sortOrder });

    res.json({ items });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✏️ Update menu item (Admins only)
router.put("/:id", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating menu item:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🗑️ Delete menu item (Admins only)
router.delete("/:id", authenticate, authorize(['admin']), async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted", item: deleted });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📦 Get distinct categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await MenuItem.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🧂 Get distinct ingredients (optional filter by category)
router.get("/ingredients", async (req, res) => {
  try {
    const match = req.query.category ? { category: req.query.category } : {};
    const ingredients = await MenuItem.distinct("ingredients", match);
    res.json(ingredients);
  } catch (err) {
    console.error("Error fetching ingredients:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 🕵️ Get single item by ID (keep last!)
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
