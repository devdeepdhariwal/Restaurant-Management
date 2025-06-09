const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  items: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
      },
      quantity: { type: Number, required: true },
      customization: String
    }
  ],
  notes: String,
  status: {
    type: String,
    enum: ["in progress", "completed", "cancelled"],
    default: "in progress",
    lowercase: true,
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0 // ✅ Total order amount in rupees
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true }); // ✅ Automatically adds createdAt and updatedAt

module.exports = mongoose.model("Order", orderSchema);
