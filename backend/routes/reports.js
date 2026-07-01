const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/reports/monthly?month=&year=
router.get('/monthly', auth, async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ message: 'month and year required' });

  try {
    // Summary totals
    const [summary] = await pool.query(
      `SELECT
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expenses
       FROM transactions
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [req.userId, month, year]
    );

    // Expenses by category
    const [byCategory] = await pool.query(
      `SELECT c.name AS category, c.color, c.icon, SUM(t.amount) AS total, COUNT(*) AS count
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.type = 'expense' AND MONTH(t.date) = ? AND YEAR(t.date) = ?
       GROUP BY t.category_id, c.name, c.color, c.icon
       ORDER BY total DESC`,
      [req.userId, month, year]
    );

    // Daily totals for the month
    const [dailyTotals] = await pool.query(
      `SELECT DAY(date) AS day, type, SUM(amount) AS total
       FROM transactions
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY DAY(date), type
       ORDER BY day`,
      [req.userId, month, year]
    );

    // Budget vs actual
    const [budgetComparison] = await pool.query(
      `SELECT b.name, b.amount AS budgeted, c.color,
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

    // Last 6 months trend
    const [trend] = await pool.query(
      `SELECT YEAR(date) AS year, MONTH(date) AS month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses
       FROM transactions
       WHERE user_id = ?
         AND date >= DATE_SUB(LAST_DAY(CONCAT(?, '-', LPAD(?, 2, '0'), '-01')), INTERVAL 5 MONTH)
         AND date <= LAST_DAY(CONCAT(?, '-', LPAD(?, 2, '0'), '-01'))
       GROUP BY YEAR(date), MONTH(date)
       ORDER BY year, month`,
      [req.userId, year, month, year, month]
    );

    res.json({
      summary: summary[0],
      byCategory,
      dailyTotals,
      budgetComparison,
      trend,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
