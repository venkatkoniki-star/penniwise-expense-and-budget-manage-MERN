const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/budgets?month=&year=
router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ message: 'month and year are required' });

  try {
    const [rows] = await pool.query(
      `SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
        COALESCE((
          SELECT SUM(t.amount) FROM transactions t
          WHERE t.user_id = b.user_id AND t.category_id = b.category_id
            AND MONTH(t.date) = b.month AND YEAR(t.date) = b.year AND t.type = 'expense'
        ), 0) AS spent
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? AND b.month = ? AND b.year = ?`,
      [req.userId, month, year]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/budgets
router.post('/', auth, async (req, res) => {
  const { category_id, name, amount, month, year } = req.body;
  if (!name || !amount || !month || !year)
    return res.status(400).json({ message: 'name, amount, month, year are required' });

  try {
    const [result] = await pool.query(
      `INSERT INTO budgets (user_id, category_id, name, amount, month, year)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount), name = VALUES(name)`,
      [req.userId, category_id || null, name, amount, month, year]
    );
    res.status(201).json({ id: result.insertId, message: 'Budget saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/budgets/:id
router.put('/:id', auth, async (req, res) => {
  const { name, amount } = req.body;
  try {
    const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (check.length === 0) return res.status(404).json({ message: 'Budget not found' });

    await pool.query('UPDATE budgets SET name=?, amount=? WHERE id=?', [name, amount, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [check] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (check.length === 0) return res.status(404).json({ message: 'Budget not found' });

    await pool.query('DELETE FROM budgets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
