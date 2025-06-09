const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const menuSearchRoutes = require("./routes/menuSearch");
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
require('dotenv').config(); // Load .env file


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/menu', menuRoutes);
app.use("/api/menu", menuSearchRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes);


// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
