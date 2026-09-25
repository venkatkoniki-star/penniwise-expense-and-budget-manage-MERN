const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// GET /api/categories
router.get('/', auth, async (req, res) => {
  const { type } = req.query;
  const filter = { user_id: req.userId };
  if (type) {
    filter.type = type;
  }

  try {
    const categories = await Category.find(filter).sort({ type: 1, name: 1 });
    res.json(
      categories.map(c => ({
        id: c._id.toString(),
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/categories
router.post('/', auth, async (req, res) => {
  const { name, type, color, icon } = req.body;
  if (!name || !type) return res.status(400).json({ message: 'name and type required' });

  try {
    const category = await Category.create({
      user_id: req.userId,
      name,
      type,
      color: color || '#6B7280',
      icon: icon || 'tag',
    });

    res.status(201).json({
      id: category._id.toString(),
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId,
    });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
