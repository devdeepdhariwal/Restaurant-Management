const MenuItem = require("../models/MenuItem");

exports.addMenuItem = async (req, res) => {
  try {
    const { name, category, price, ingredients, tags, availability } = req.body;

    const newItem = new MenuItem({
      name,
      category,
      price,
      ingredients: ingredients.split(",").map((i) => i.trim()),
      tags: tags.split(",").map((t) => t.trim()),
      availability,
    });

    await newItem.save();
    res.status(201).json({ message: "Menu item added", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error });
  }
};
