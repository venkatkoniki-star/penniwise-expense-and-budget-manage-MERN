const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const formatTransaction = (t) => {
  const cat = t.category_id;
  const isPopulated = cat && typeof cat === 'object' && cat.name;

  return {
    id: t._id.toString(),
    user_id: t.user_id.toString(),
    category_id: isPopulated ? cat._id.toString() : (cat ? cat.toString() : null),
    category_name: isPopulated ? cat.name : null,
    category_color: isPopulated ? cat.color : null,
    category_icon: isPopulated ? cat.icon : null,
    type: t.type,
    amount: t.amount,
    description: t.description || '',
    date: t.date,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
};

// GET /api/transactions — with optional filters
router.get('/', auth, async (req, res) => {
  const { month, year, type, category_id, limit = 50, offset = 0 } = req.query;

  const filter = { user_id: req.userId };

  if (month && year) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
    filter.date = { $gte: start, $lt: end };
  }

  if (type) {
    filter.type = type;
  }

  if (category_id) {
    filter.category_id = category_id;
  }

  try {
    const transactions = await Transaction.find(filter)
      .populate('category_id')
      .sort({ date: -1, created_at: -1 })
      .skip(parseInt(offset, 10))
      .limit(parseInt(limit, 10));

    res.json(transactions.map(formatTransaction));
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
    const transaction = await Transaction.create({
      user_id: req.userId,
      category_id: category_id || null,
      type,
      amount: parseFloat(amount),
      description: description || '',
      date: new Date(date),
    });

    await transaction.populate('category_id');
    res.status(201).json(formatTransaction(transaction));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', auth, async (req, res) => {
  const { category_id, type, amount, description, date } = req.body;

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      {
        category_id: category_id || null,
        type,
        amount: parseFloat(amount),
        description: description || '',
        date: new Date(date),
      },
      { new: true }
    ).populate('category_id');

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    res.json(formatTransaction(transaction));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId,
    });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
