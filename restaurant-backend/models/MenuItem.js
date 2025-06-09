const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  ingredients: [String],
  tags: [String], // e.g. ["vegan", "spicy"]
  availability: { type: Boolean, default: true },
}, { timestamps: true }); // ✅ Adds createdAt and updatedAt automatically

module.exports = mongoose.model('MenuItem', MenuItemSchema);

