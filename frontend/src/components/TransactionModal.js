import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';

const TransactionModal = ({ onClose, onSaved, editing }) => {
  const [type, setType] = useState(editing?.type || 'expense');
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: editing?.category_id || '',
    amount: editing?.amount || '',
    description: editing?.description || '',
    date: editing?.date ? editing.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories', { params: { type } }).then(res => setCategories(res.data));
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.amount || !form.date) {
      setError('Amount and date are required');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, type, category_id: form.category_id || null };
      if (editing) {
        await api.put(`/transactions/${editing.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{editing ? 'Edit Transaction' : 'Add Transaction'}</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`type-btn income ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Uncategorized</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="e.g. Groceries at Trader Joe's"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
