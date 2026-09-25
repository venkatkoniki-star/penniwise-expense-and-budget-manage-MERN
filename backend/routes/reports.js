const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// GET /api/reports/monthly?month=&year=
router.get('/monthly', auth, async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ message: 'month and year required' });

  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  try {
    const startOfMonth = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));

    // Transactions for the target month
    const monthTransactions = await Transaction.find({
      user_id: req.userId,
      date: { $gte: startOfMonth, $lt: endOfMonth },
    }).populate('category_id');

    // 1. Summary totals
    let total_income = 0;
    let total_expenses = 0;
    for (const t of monthTransactions) {
      if (t.type === 'income') {
        total_income += t.amount || 0;
      } else if (t.type === 'expense') {
        total_expenses += t.amount || 0;
      }
    }

    // 2. Expenses by category
    const categoryMap = new Map();
    for (const t of monthTransactions) {
      if (t.type !== 'expense') continue;
      const cat = t.category_id;
      const isPopulated = cat && typeof cat === 'object' && cat.name;
      const catId = isPopulated ? cat._id.toString() : 'uncategorized';
      const catName = isPopulated ? cat.name : 'Uncategorized';
      const catColor = isPopulated ? (cat.color || '#6B7280') : '#6B7280';
      const catIcon = isPopulated ? (cat.icon || 'tag') : 'tag';

      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          category: catName,
          color: catColor,
          icon: catIcon,
          total: 0,
          count: 0,
        });
      }
      const entry = categoryMap.get(catId);
      entry.total += t.amount || 0;
      entry.count += 1;
    }
    const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);

    // 3. Daily totals for the month
    const dailyMap = new Map();
    for (const t of monthTransactions) {
      const day = new Date(t.date).getUTCDate();
      const key = `${day}_${t.type}`;
      if (!dailyMap.has(key)) {
        dailyMap.set(key, { day, type: t.type, total: 0 });
      }
      dailyMap.get(key).total += t.amount || 0;
    }
    const dailyTotals = Array.from(dailyMap.values()).sort((a, b) => a.day - b.day);

    // 4. Budget vs actual
    const budgets = await Budget.find({
      user_id: req.userId,
      month: m,
      year: y,
    }).populate('category_id');

    const budgetComparison = budgets.map((b) => {
      const cat = b.category_id;
      const isPopulated = cat && typeof cat === 'object' && cat.name;
      const catIdStr = isPopulated ? cat._id.toString() : (cat ? cat.toString() : null);

      let spent = 0;
      if (catIdStr) {
        spent = monthTransactions
          .filter(
            (t) =>
              t.type === 'expense' &&
              t.category_id &&
              (t.category_id._id ? t.category_id._id.toString() : t.category_id.toString()) === catIdStr
          )
          .reduce((sum, t) => sum + (t.amount || 0), 0);
      } else {
        spent = monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
      }

      return {
        name: b.name,
        budgeted: b.amount,
        color: isPopulated ? cat.color : '#4F46E5',
        spent,
      };
    });

    // 5. Last 6 months trend
    const trendMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(y, m - 1 - i, 1));
      trendMonths.push({
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
      });
    }

    const trendStart = new Date(Date.UTC(trendMonths[0].year, trendMonths[0].month - 1, 1, 0, 0, 0, 0));
    const trendEnd = endOfMonth;

    const trendTransactions = await Transaction.find({
      user_id: req.userId,
      date: { $gte: trendStart, $lt: trendEnd },
    });

    const trend = trendMonths.map(({ year: tYear, month: tMonth }) => {
      const startT = new Date(Date.UTC(tYear, tMonth - 1, 1, 0, 0, 0, 0));
      const endT = new Date(Date.UTC(tYear, tMonth, 1, 0, 0, 0, 0));

      let income = 0;
      let expenses = 0;

      for (const t of trendTransactions) {
        const tDate = new Date(t.date);
        if (tDate >= startT && tDate < endT) {
          if (t.type === 'income') {
            income += t.amount || 0;
          } else if (t.type === 'expense') {
            expenses += t.amount || 0;
          }
        }
      }

      return {
        year: tYear,
        month: tMonth,
        income,
        expenses,
      };
    });

    res.json({
      summary: {
        total_income,
        total_expenses,
      },
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
