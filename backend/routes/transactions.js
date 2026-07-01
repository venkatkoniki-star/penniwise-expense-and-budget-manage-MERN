const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/transactions — with optional filters
router.get('/', auth, async (req, res) => {
  const { month, year, type, category_id, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
  `;
  const params = [req.userId];

  if (month && year) {
    query += ' AND MONTH(t.date) = ? AND YEAR(t.date) = ?';
    params.push(month, year);
  }
  if (type) { query += ' AND t.type = ?'; params.push(type); }
  if (category_id) { query += ' AND t.category_id = ?'; params.push(category_id); }

  query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/transactions
router.post('/', auth, async (req, res) => {
  const { category_id, type, amount, description, date } = req.body;

  if (!type || !amount || !date)
    return res.status(400).json({ message: 'Type, amount, and date are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, category_id || null, type, amount, description || '', date]
    );
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', auth, async (req, res) => {
  const { category_id, type, amount, description, date } = req.body;

  try {
    const [check] = await pool.query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (check.length === 0) return res.status(404).json({ message: 'Transaction not found' });

    await pool.query(
      'UPDATE transactions SET category_id=?, type=?, amount=?, description=?, date=? WHERE id=?',
      [category_id || null, type, amount, description || '', date, req.params.id]
    );
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [check] = await pool.query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (check.length === 0) return res.status(404).json({ message: 'Transaction not found' });

    await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
