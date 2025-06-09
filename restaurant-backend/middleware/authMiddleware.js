const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // use process.env.JWT_SECRET ideally
    const user = await User.findById(decoded.userId); // Fetch user by ID

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id,
      role: user.role,
    };

    console.log("✅ Authenticated:", req.user.role); // Debug log
    next();
  } catch (err) {
    console.error("❌ Authentication failed:", err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
  
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
