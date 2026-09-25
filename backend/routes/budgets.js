const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// GET /api/budgets?month=&year=
router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ message: 'month and year are required' });

  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  try {
    const budgets = await Budget.find({
      user_id: req.userId,
      month: m,
      year: y,
    }).populate('category_id');

    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));

    const expenseTransactions = await Transaction.find({
      user_id: req.userId,
      type: 'expense',
      date: { $gte: start, $lt: end },
    });

    const result = budgets.map((b) => {
      const cat = b.category_id;
      const isPopulated = cat && typeof cat === 'object' && cat.name;
      const catIdStr = isPopulated ? cat._id.toString() : (cat ? cat.toString() : null);

      let spent = 0;
      if (catIdStr) {
        spent = expenseTransactions
          .filter((t) => t.category_id && t.category_id.toString() === catIdStr)
          .reduce((sum, t) => sum + (t.amount || 0), 0);
      } else {
        spent = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      }

      return {
        id: b._id.toString(),
        user_id: b.user_id.toString(),
        category_id: catIdStr,
        category_name: isPopulated ? cat.name : null,
        category_color: isPopulated ? cat.color : null,
        category_icon: isPopulated ? cat.icon : null,
        name: b.name,
        amount: b.amount,
        month: b.month,
        year: b.year,
        spent,
        created_at: b.created_at,
        updated_at: b.updated_at,
      };
    });

    res.json(result);
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
    const filter = {
      user_id: req.userId,
      category_id: category_id || null,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    };

    const update = {
      name,
      amount: parseFloat(amount),
    };

    const budget = await Budget.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, upsert: true }
    );

    res.status(201).json({
      id: budget._id.toString(),
      name: budget.name,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      message: 'Budget saved',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/budgets/:id
router.put('/:id', auth, async (req, res) => {
  const { name, amount } = req.body;
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { name, amount: parseFloat(amount) },
      { new: true }
    );

    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId,
    });

    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
