const Order = require('../models/Order');
const mongoose = require('mongoose');

// ✅ Daily Sales Report (with optional ?days=7, 14, 30)
exports.getDailySales = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Category-wise Revenue (Pie Chart)
exports.getCategoryRevenue = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menuitems", // collection name in MongoDB
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItemDetails"
        }
      },
      { $unwind: "$menuItemDetails" },
      {
        $group: {
          _id: "$menuItemDetails.category",
          totalRevenue: {
            $sum: {
              $multiply: ["$items.quantity", "$menuItemDetails.price"]
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Peak Hour Analysis
exports.getPeakHours = async (req, res) => {
  try {
    const peakHours = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $project: {
          hour: { $hour: "$createdAt" }
        }
      },
      {
        $group: {
          _id: "$hour",
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(peakHours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
