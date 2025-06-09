const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// 🧑‍💼 Register new staff (admin only)
router.post('/register', authenticate, authorize(['admin']), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ User already exists with this email:", email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // ✅ Don't hash manually — Mongoose will do it in pre('save')
    const user = new User({ name, email, password, role });
    await user.save();

    console.log("✅ Staff registered successfully:", user.email);
    res.status(201).json({ message: 'Staff registered successfully' });
  } catch (err) {
    console.error("❌ Error during staff registration:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// ❌ Delete a staff member
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get all staff
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['chef', 'waiter', 'receptionist'] } }, '-password');

    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
