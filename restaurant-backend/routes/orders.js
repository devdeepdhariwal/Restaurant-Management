const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  getDailySales,
  getCategoryRevenue,
  getPeakHours
} = require("../controllers/orderController");

// 🧠 Helper to recalculate totalAmount
async function recalculateTotalAmount(orderId) {
  const order = await Order.findById(orderId).populate("items.menuItemId");
  let total = 0;
  for (const item of order.items) {
    total += item.menuItemId.price * item.quantity;
  }
  order.totalAmount = total;
  await order.save();
  return order;
}

// ✅ Normalize statuses
router.put("/fix-statuses", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const result = await Order.updateMany(
      {},
      [
        {
          $set: {
            status: {
              $toLower: { $trim: { input: "$status" } }
            }
          }
        }
      ]
    );
    res.json({ message: "Statuses normalized", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("❌ Error normalizing statuses:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📊 Analytics Routes
router.get("/analytics/daily-sales", authenticate, authorize(["admin"]), getDailySales);
router.get("/analytics/category-revenue", authenticate, authorize(["admin"]), getCategoryRevenue);
router.get("/analytics/peak-hours", authenticate, authorize(["admin"]), getPeakHours);

// ✅ Active Orders
router.get("/active", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'in progress' }).populate("items.menuItemId");
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching active orders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Completed Orders
router.get("/completed", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .populate("items.menuItemId");
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching completed orders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch all or filtered orders
router.get("/", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status.toLowerCase();

    const orders = await Order.find(query)
      .sort({ updatedAt: -1 })
      .populate("items.menuItemId");

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Create a new order
router.post("/", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    for (const item of req.body.items) {
      if (!mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        return res.status(400).json({ error: `Invalid menuItemId: ${item.menuItemId}` });
      }
    }

    const itemIds = req.body.items.map(item => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: itemIds } });

    let totalAmount = 0;
    for (const item of req.body.items) {
      const matched = menuItems.find(menu => menu._id.toString() === item.menuItemId);
      if (!matched) {
        return res.status(404).json({ error: `MenuItem not found: ${item.menuItemId}` });
      }
      totalAmount += matched.price * item.quantity;
    }

    const newOrder = new Order({
      ...req.body,
      createdBy: req.user.id,
      status: "in progress",
      totalAmount
    });

    await newOrder.save();
    const populated = await newOrder.populate("items.menuItemId");
    res.status(201).json({ message: "Order placed successfully", order: populated });

  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add item to order
router.put("/:id/add-item", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const item = req.body;

    if (!item.menuItemId || !mongoose.Types.ObjectId.isValid(item.menuItemId)) {
      return res.status(400).json({ error: "Invalid menuItemId" });
    }

    await Order.findByIdAndUpdate(
      req.params.id,
      { $push: { items: item } },
      { new: true }
    );

    const updatedOrder = await recalculateTotalAmount(req.params.id);
    res.json(updatedOrder);
  } catch (err) {
    console.error("❌ Error adding item:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Remove item from order
router.put("/:id/remove-item", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const { menuItemId } = req.body;

    await Order.findByIdAndUpdate(
      req.params.id,
      { $pull: { items: { menuItemId } } },
      { new: true }
    );

    const updatedOrder = await recalculateTotalAmount(req.params.id);
    res.json(updatedOrder);
  } catch (err) {
    console.error("❌ Error removing item:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update specific item in an order
router.put("/:orderId/update-item", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const { menuItemId, quantity, customization } = req.body;

    const updated = await Order.findOneAndUpdate(
      { _id: req.params.orderId, "items.menuItemId": menuItemId },
      {
        $set: {
          "items.$.quantity": quantity,
          "items.$.customization": customization,
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    const finalOrder = await recalculateTotalAmount(req.params.orderId);
    res.json(finalOrder);
  } catch (err) {
    console.error("❌ Error updating item:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update order status
router.put("/:id/status", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status: status.toLowerCase() };

    if (status.toLowerCase() === "completed") {
      update.completedAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate("items.menuItemId");

    res.json(updatedOrder);
  } catch (err) {
    console.error("❌ Error updating status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch one specific order
router.get("/:id", authenticate, authorize(["receptionist"]), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.menuItemId");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
