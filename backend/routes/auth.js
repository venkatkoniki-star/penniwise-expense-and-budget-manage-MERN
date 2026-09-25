const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', type: 'expense', color: '#F97316', icon: 'utensils' },
  { name: 'Transport', type: 'expense', color: '#3B82F6', icon: 'car' },
  { name: 'Shopping', type: 'expense', color: '#8B5CF6', icon: 'shopping-bag' },
  { name: 'Housing', type: 'expense', color: '#EF4444', icon: 'home' },
  { name: 'Health', type: 'expense', color: '#10B981', icon: 'heart' },
  { name: 'Entertainment', type: 'expense', color: '#F59E0B', icon: 'film' },
  { name: 'Education', type: 'expense', color: '#6366F1', icon: 'book' },
  { name: 'Other Expense', type: 'expense', color: '#6B7280', icon: 'tag' },
  { name: 'Salary', type: 'income', color: '#10B981', icon: 'briefcase' },
  { name: 'Freelance', type: 'income', color: '#3B82F6', icon: 'laptop' },
  { name: 'Investment', type: 'income', color: '#F59E0B', icon: 'trending-up' },
  { name: 'Other Income', type: 'income', color: '#6B7280', icon: 'plus-circle' },
];

// POST /api/auth/register or /api/auth/signup
router.post(['/register', '/signup'], async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      currency: 'INR',
    });

    // Seed default categories
    const catValues = DEFAULT_CATEGORIES.map(c => ({
      user_id: user._id,
      name: c.name,
      type: c.type,
      color: c.color,
      icon: c.icon,
    }));
    await Category.insertMany(catValues);

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        currency: user.currency || 'INR',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email currency created_at');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency || 'INR',
      created_at: user.created_at,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
