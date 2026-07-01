const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/categories
router.get('/', auth, async (req, res) => {
  const { type } = req.query;
  let query = 'SELECT * FROM categories WHERE user_id = ?';
  const params = [req.userId];
  if (type) { query += ' AND type = ?'; params.push(type); }
  query += ' ORDER BY type, name';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/categories
router.post('/', auth, async (req, res) => {
  const { name, type, color, icon } = req.body;
  if (!name || !type) return res.status(400).json({ message: 'name and type required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?)',
      [req.userId, name, type, color || '#6B7280', icon || 'tag']
    );
    res.status(201).json({ id: result.insertId, name, type, color, icon });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [check] = await pool.query('SELECT id FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (check.length === 0) return res.status(404).json({ message: 'Category not found' });

    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
