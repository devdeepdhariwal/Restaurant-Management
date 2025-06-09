const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// 🔐 Register new user (admin or staff)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // No manual hashing here — the model will hash it
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📥 Login attempt:', email, password);

  const user = await User.findOne({ email });
  console.log('🔍 Found user:', user);

  if (!user) return res.status(400).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('🔐 Password match:', isMatch);

  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    'your_jwt_secret',
    { expiresIn: '1d' }
  );

  console.log('✅ Login successful. Token generated.');
  res.json({ token, role: user.role });
});


module.exports = router;
